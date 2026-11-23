import { parseInePayload, type IneScanData } from "./ineParser";

type TesseractWorker = import("tesseract.js").Worker;
type ProgressHandler = (value: number) => void;
type ImageSource = Blob | HTMLCanvasElement | HTMLVideoElement;

// tessdata_fast: 1.1 MB en lugar de los 8.4 MB del paquete por defecto.
const LANG_PATH = "https://tessdata.projectnaptha.com/4.0.0_fast";
// El modelo estándar incluye el motor clásico, único que distingue J de I;
// el LSTM rápido (tessdata_fast) confunde la J con una I en la clave.
const LEGACY_LANG_PATH = "https://tessdata.projectnaptha.com/4.0.0";
const MAX_SIDE = 2200;
const WHITELIST = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let workerPromise: Promise<TesseractWorker> | null = null;
let legacyWorkerPromise: Promise<TesseractWorker> | null = null;
let progressSink: ProgressHandler | null = null;
let queue: Promise<unknown> = Promise.resolve();

const getWorker = () => {
   if (!workerPromise) {
      workerPromise = (async () => {
         const { createWorker } = await import("tesseract.js");
         return createWorker("spa", undefined, {
            langPath: LANG_PATH,
            logger: (message) => {
               if (message.status === "recognizing text") progressSink?.(message.progress ?? 0);
            }
         });
      })().catch((error) => {
         workerPromise = null;
         throw error;
      });
   }
   return workerPromise;
};

const getLegacyWorker = () => {
   if (!legacyWorkerPromise) {
      legacyWorkerPromise = (async () => {
         const { createWorker, OEM } = await import("tesseract.js");
         return createWorker("spa", OEM.TESSERACT_ONLY, {
            langPath: LEGACY_LANG_PATH,
            logger: (message) => {
               if (typeof message.progress === "number") progressSink?.(message.progress);
            }
         });
      })().catch((error) => {
         legacyWorkerPromise = null;
         throw error;
      });
   }
   return legacyWorkerPromise;
};

const decodeBlob = async (blob: Blob) => {
   if (typeof createImageBitmap === "function") {
      try {
         return await createImageBitmap(blob);
      } catch {
         // Safari antiguo rechaza algunos JPEG; se intenta con <img>.
      }
   }
   const url = URL.createObjectURL(blob);
   try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
         image.onload = () => resolve();
         image.onerror = () => reject(new Error("Imagen inválida"));
         image.src = url;
      });
      return image;
   } finally {
      URL.revokeObjectURL(url);
   }
};

const resolveSource = async (source: ImageSource) => {
   if (source instanceof Blob) {
      const image = await decodeBlob(source);
      return { image: image as CanvasImageSource, width: image.width, height: image.height };
   }
   if (typeof HTMLVideoElement !== "undefined" && source instanceof HTMLVideoElement) {
      return { image: source as CanvasImageSource, width: source.videoWidth, height: source.videoHeight };
   }
   const canvas = source as HTMLCanvasElement;
   return { image: canvas as CanvasImageSource, width: canvas.width, height: canvas.height };
};

const drawToCanvas = (image: CanvasImageSource, width: number, height: number) => {
   const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
   const canvas = document.createElement("canvas");
   canvas.width = Math.max(1, Math.round(width * scale));
   canvas.height = Math.max(1, Math.round(height * scale));
   const context = canvas.getContext("2d");
   if (!context) throw new Error("El navegador no soporta canvas");
   context.drawImage(image, 0, 0, canvas.width, canvas.height);
   return canvas;
};

/** Escala de grises con estiramiento de contraste; en modo binario además umbraliza. */
const enhance = (canvas: HTMLCanvasElement, binary: boolean) => {
   const context = canvas.getContext("2d");
   if (!context) return canvas;
   const image = context.getImageData(0, 0, canvas.width, canvas.height);
   const { data } = image;
   const gray = new Uint8ClampedArray(canvas.width * canvas.height);
   let min = 255;
   let max = 0;

   for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
      const value = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
      gray[pixel] = value;
      if (value < min) min = value;
      if (value > max) max = value;
   }

   const range = Math.max(1, max - min);
   for (let i = 0, pixel = 0; i < data.length; i += 4, pixel += 1) {
      let value = ((gray[pixel] - min) / range) * 255;
      if (binary) value = value < 150 ? 0 : 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
   }

   context.putImageData(image, 0, 0);
   return canvas;
};

type PageSegMode = import("tesseract.js").PSM;

// La franja MRZ del reverso no contiene la clave; unir sus campos podría producir
// una clave falsa que pase el formato, así que esa foto se descarta.
const parseOcrText = (text: string) => {
   const compact = text.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
   return compact.includes("IDMEX") ? null : parseInePayload(text, { fuzzy: true });
};

const recognize = async (worker: TesseractWorker, canvas: HTMLCanvasElement, psm: PageSegMode) => {
   await worker.setParameters({
      tessedit_char_whitelist: WHITELIST,
      tessedit_pageseg_mode: psm,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300"
   });
   const { data } = await worker.recognize(canvas);
   return data.text ?? "";
};

/**
 * El LSTM rápido no distingue J de I y a veces desplaza la clave o confunde
 * dígitos. El motor clásico lee la línea impresa con mucha más precisión, así
 * que se usa como segunda lectura: si devuelve una clave válida, es la que se
 * muestra; si no está disponible, se conserva la del LSTM.
 */
const verifyKeyWithLegacy = async (key: string, canvas: HTMLCanvasElement) => {
   try {
      const legacy = await getLegacyWorker();
      const { PSM } = await import("tesseract.js");
      const alternative = parseOcrText(await recognize(legacy, canvas, PSM.AUTO))?.electorKey ?? null;
      return alternative ?? key;
   } catch {
      // Sin motor clásico se conserva la lectura del LSTM.
      return key;
   }
};

const run = async (source: ImageSource, onProgress?: ProgressHandler): Promise<IneScanData | null> => {
   const worker = await getWorker();
   const { image, width, height } = await resolveSource(source);
   if (!width || !height) throw new Error("Imagen vacía");

   try {
      // La clave impresa va en negro sobre fondo claro: dos pasadas (gris y binaria)
      // mejoran la lectura cuando hay reflejos del plástico.
      const { PSM } = await import("tesseract.js");
      const canvas = enhance(drawToCanvas(image, width, height), false);
      progressSink = (value) => onProgress?.(value * 0.55);
      let electorKey = parseOcrText(await recognize(worker, canvas, PSM.AUTO))?.electorKey ?? null;
      let verificationCanvas = canvas;
      let verificationBase = 0.55;

      if (!electorKey) {
         progressSink = (value) => onProgress?.(0.55 + value * 0.45);
         verificationCanvas = enhance(canvas, true);
         verificationBase = 0.9;
         electorKey = parseOcrText(await recognize(worker, verificationCanvas, PSM.SPARSE_TEXT))?.electorKey ?? null;
      }

      if (!electorKey) return null;
      progressSink = (value) => onProgress?.(verificationBase + (1 - verificationBase) * value);
      electorKey = await verifyKeyWithLegacy(electorKey, verificationCanvas);
      // No se devuelve texto ni CURP: el OCR puede confundir 0/O justo en la
      // posición ambigua de la CURP y una CURP errónea bloquea registros válidos.
      return { electorKey, curp: null, raw: "" };
   } finally {
      progressSink = null;
      if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) image.close();
   }
};

/** Lee la Clave de Elector del frente de la INE sin salir del dispositivo. */
export const extractIneFromFront = (source: ImageSource, onProgress?: ProgressHandler): Promise<IneScanData | null> => {
   const job = queue.then(() => run(source, onProgress));
   queue = job.catch(() => undefined);
   return job;
};
