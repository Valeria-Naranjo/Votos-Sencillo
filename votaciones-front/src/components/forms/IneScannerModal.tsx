import { useCallback, useEffect, useRef, useState } from "react";
import { extractIneFromFront } from "../../utils/ineOcr";
import { isValidCurp, isValidElectorKey, normalizeElectorKey, type IneScanData } from "../../utils/ineParser";
import Toast from "../../utils/Toast";

interface IneScannerModalProps {
   open: boolean;
   onClose: () => void;
   onDetected: (data: IneScanData) => void;
}

type Status = "starting" | "ready" | "reading";

// Sin resolución suficiente, el texto de la clave queda borroso para el OCR.
const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
   video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
   }
};

const cameraErrorMessage = (error: unknown) => {
   const name = (error as { name?: string })?.name;
   if (name === "NotAllowedError" || name === "SecurityError") return "El navegador bloqueó la cámara. Concede el permiso e inténtalo de nuevo o sube una foto del frente.";
   if (name === "NotFoundError" || name === "OverconstrainedError") return "No se encontró una cámara disponible en este dispositivo. Sube una foto del frente.";
   if (name === "NotReadableError") return "La cámara está siendo usada por otra aplicación. Sube una foto del frente.";
   return "No fue posible iniciar la cámara. Puedes subir una foto del frente de la INE.";
};

const IneScannerModal = ({ open, onClose, onDetected }: IneScannerModalProps) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   const streamRef = useRef<MediaStream>();
   const frontInputRef = useRef<HTMLInputElement>(null);
   const [status, setStatus] = useState<Status>("starting");
   const [error, setError] = useState("");
   const [progress, setProgress] = useState(0);
   const [review, setReview] = useState<{ key: string; curp: string } | null>(null);
   const [reviewError, setReviewError] = useState("");
   const [torchAvailable, setTorchAvailable] = useState(false);
   const [torchOn, setTorchOn] = useState(false);
   // Se incrementa cuando hay que reabrir la cámara tras un intento fallido.
   const [cameraAttempt, setCameraAttempt] = useState(0);

   const stopCamera = useCallback(() => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = undefined;
   }, []);

   // Reinicia la interfaz cada vez que se abre el modal.
   useEffect(() => {
      if (!open) return;
      setStatus("starting");
      setError("");
      setProgress(0);
      setReview(null);
      setReviewError("");
      setTorchOn(false);
      setTorchAvailable(false);
   }, [open]);

   useEffect(() => {
      if (!open || review) return;

      let disposed = false;
      const start = async () => {
         try {
            const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS);
            const video = videoRef.current;
            if (disposed || !video) {
               stream.getTracks().forEach((track) => track.stop());
               return;
            }

            streamRef.current = stream;
            video.srcObject = stream;
            await video.play().catch(() => undefined);
            setStatus("ready");

            const track = stream.getVideoTracks()[0];
            const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
            setTorchAvailable(!!caps.torch);
         } catch (err) {
            if (disposed) return;
            setStatus("ready");
            setError(cameraErrorMessage(err));
         }
      };

      start();

      return () => {
         disposed = true;
         stopCamera();
         setTorchOn(false);
         setTorchAvailable(false);
      };
   }, [open, review, cameraAttempt, stopCamera]);

   useEffect(() => {
      if (!open) return;
      const onKeyDown = (event: KeyboardEvent) => {
         if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
   }, [open, onClose]);

   const retryCamera = () => {
      setStatus("starting");
      setError("");
      setProgress(0);
      setCameraAttempt((value) => value + 1);
   };

   const readFront = async (source: File | HTMLCanvasElement) => {
      stopCamera();
      setError("");
      setReviewError("");
      setStatus("reading");
      setProgress(0);
      try {
         const data = await extractIneFromFront(source, setProgress);
         if (!data?.electorKey) {
            retryCamera();
            Toast.Warning("No se pudo leer la clave. Centra la credencial en el recuadro, acércala un poco y vuelve a intentarlo.", "center", "bottom", 4500);
            return;
         }
         setReview({ key: data.electorKey, curp: "" });
      } catch {
         retryCamera();
         Toast.Warning("No se pudo leer la foto. Revisa tu conexión e inténtalo de nuevo, o escribe la clave manualmente.", "center", "bottom", 4500);
      }
   };

   const captureFront = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !video.videoWidth) {
         frontInputRef.current?.click();
         return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
         frontInputRef.current?.click();
         return;
      }
      ctx.drawImage(video, 0, 0);
      readFront(canvas);
   };

   const openManualReview = () => {
      stopCamera();
      setError("");
      setReviewError("");
      setReview({ key: "", curp: "" });
   };

   const restart = () => {
      setReview(null);
      setReviewError("");
      setError("");
      setProgress(0);
      setStatus("starting");
   };

   const confirmReview = () => {
      if (!review) return;
      const electorKey = normalizeElectorKey(review.key);
      if (!isValidElectorKey(electorKey)) {
         setReviewError("Clave inválida: deben ser 18 caracteres (6 letras, la fecha AAMMDD y 6 alfanuméricos).");
         return;
      }
      const curp = normalizeElectorKey(review.curp);
      if (curp && !isValidCurp(curp)) {
         setReviewError("La CURP no tiene un formato válido; corrígela o déjala vacía.");
         return;
      }
      stopCamera();
      onDetected({ electorKey, curp: curp || null, raw: "" });
   };

   const toggleTorch = async () => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (!track) return;
      try {
         await track.applyConstraints({ advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet] });
         setTorchOn((value) => !value);
      } catch {
         setTorchAvailable(false);
      }
   };

   if (!open) return null;

   return (
      <div
         className="ine-scanner-overlay"
         onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
         }}
      >
         <div className="ine-scanner" role="dialog" aria-modal="true" aria-labelledby="ine-scanner-title">
            <div className="ine-scanner__head">
               <div>
                  <h3 id="ine-scanner-title">Leer credencial INE</h3>
                  <p>La Clave de Elector son 18 caracteres impresos en el frente. La imagen nunca se guarda.</p>
               </div>
               <button type="button" className="ine-scanner__close" onClick={onClose} aria-label="Cerrar escáner">
                  ×
               </button>
            </div>

            {review ? (
               <div className="ine-scanner__review">
                  <strong>Revisa los datos antes de continuar</strong>
                  <p>Compara la clave con la que está impresa bajo tu nombre en el frente de la credencial.</p>
                  <label className="ine-scanner__field">
                     Clave de Elector
                     <input
                        value={review.key}
                        maxLength={18}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="ABCDEF90010109M000"
                        onChange={(event) => {
                           setReview({ ...review, key: normalizeElectorKey(event.target.value) });
                           setReviewError("");
                        }}
                     />
                  </label>
                  <label className="ine-scanner__field">
                     CURP (opcional)
                     <input
                        value={review.curp}
                        maxLength={18}
                        autoComplete="off"
                        spellCheck={false}
                        onChange={(event) => {
                           setReview({ ...review, curp: normalizeElectorKey(event.target.value) });
                           setReviewError("");
                        }}
                     />
                  </label>
                  {reviewError && (
                     <p className="ine-scanner__review-error" role="alert">
                        {reviewError}
                     </p>
                  )}
                  <div className="ine-scanner__review-actions">
                     <button type="button" className="ine-scanner__btn" onClick={restart}>
                        Volver
                     </button>
                     <button type="button" className="ine-scanner__btn is-primary" onClick={confirmReview}>
                        Usar estos datos
                     </button>
                  </div>
               </div>
            ) : (
               <>
                  <div className="ine-scanner__viewport">
                     <video ref={videoRef} className="ine-scanner__video" autoPlay muted playsInline />
                     {!error && <div className="ine-scanner__frame" aria-hidden="true" />}
                     {status === "starting" && <div className="ine-scanner__state">Iniciando cámara…</div>}
                     {status === "reading" && (
                        <div className="ine-scanner__state">
                           {progress > 0 ? `Leyendo el frente… ${Math.round(progress * 100)}%` : "Preparando el lector OCR…"}
                        </div>
                     )}
                     {status === "ready" && !error && (
                        <div className="ine-scanner__guide">Centra la credencial en el recuadro y toca «Capturar frente»</div>
                     )}
                     {error && <div className="ine-scanner__error">{error}</div>}
                  </div>

                  <p className="ine-scanner__hint">El OCR corre en tu teléfono; la foto no se envía a ningún servidor. Buena luz y sin reflejos.</p>

                  <div className="ine-scanner__actions">
                     <button type="button" className="ine-scanner__btn is-primary" onClick={captureFront}>
                        Capturar frente
                     </button>
                     <label className="ine-scanner__btn">
                        Subir foto
                        <input
                           ref={frontInputRef}
                           type="file"
                           accept="image/*"
                           onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) readFront(file);
                              event.target.value = "";
                           }}
                        />
                     </label>
                     {torchAvailable && (
                        <button type="button" className="ine-scanner__btn" onClick={toggleTorch}>
                           {torchOn ? "Apagar linterna" : "Encender linterna"}
                        </button>
                     )}
                     <button type="button" className="ine-scanner__btn" onClick={openManualReview}>
                        Escribir clave
                     </button>
                     <button type="button" className="ine-scanner__btn" onClick={onClose}>
                        Cancelar
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
};

export default IneScannerModal;
