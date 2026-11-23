export interface IneScanData {
   electorKey: string | null;
   curp: string | null;
   raw: string;
}

const ELECTOR_KEY_PATTERN = /[A-Z]{6}\d{6}[A-Z0-9]{6}/g;
const CURP_PATTERN = /[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d/g;
const ELECTOR_KEY_FORMAT = /^[A-Z]{6}\d{6}[A-Z0-9]{6}$/;
const CURP_FORMAT = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

const hasPlausibleDate = (value: string, monthIndex: number) => {
   const month = Number(value.slice(monthIndex, monthIndex + 2));
   const day = Number(value.slice(monthIndex + 2, monthIndex + 4));
   return month >= 1 && month <= 12 && day >= 1 && day <= 31;
};

const findFirstValid = (text: string, pattern: RegExp, validate: (value: string) => boolean) => {
   pattern.lastIndex = 0;
   let match: RegExpExecArray | null;
   while ((match = pattern.exec(text)) !== null) {
      if (validate(match[0])) return match[0];
   }
   return null;
};

const normalizeText = (payload: string) =>
   (payload ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

const compactText = (text: string) => text.replace(/[^A-Z0-9]/g, "");

// El OCR confunde letras y números con formas parecidas (O/0, I/1, S/5, B/8...).
// S puede ser 5 u 8; se prueban ambas y se elige la primera combinación válida,
// de modo que la misma lectura siempre produce la misma clave.
const LETTER_SHAPED_AS_DIGIT: Record<string, string[]> = {
   O: ["0"],
   Q: ["0"],
   D: ["0"],
   I: ["1"],
   L: ["1"],
   Z: ["2"],
   A: ["4"],
   S: ["5", "8"],
   G: ["6"],
   T: ["7"],
   B: ["8"]
};
const DIGIT_SHAPED_AS_LETTER: Record<string, string> = { 0: "O", 1: "I", 2: "Z", 4: "A", 5: "S", 6: "G", 7: "T", 8: "B" };

const expandDigitSlots = (chars: string[]) => {
   let variants = [""];
   for (const char of chars) {
      const options = /\d/.test(char) ? [char] : LETTER_SHAPED_AS_DIGIT[char];
      if (!options) return [];
      variants = variants.flatMap((prefix) => options.map((option) => prefix + option));
      if (variants.length > 8) return [];
   }
   return variants;
};

const isPlausibleBirthDate = (date: string) => {
   const now = new Date();
   const yearShort = Number(date.slice(0, 2));
   const year = yearShort <= now.getFullYear() % 100 ? 2000 + yearShort : 1900 + yearShort;
   const month = Number(date.slice(2, 4));
   const day = Number(date.slice(4, 6));
   if (month < 1 || month > 12 || day < 1 || day > new Date(year, month, 0).getDate()) return false;
   let age = now.getFullYear() - year;
   if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) age -= 1;
   return age >= 16 && age <= 110;
};

/** El código de entidad del INE va del 01 al 32. */
const isPlausibleEntity = (entity: string) => {
   const code = Number(entity);
   return code >= 1 && code <= 32;
};

/**
 * Corrige confusiones donde el formato de la clave exige letra (primeras 6),
 * fecha (6 dígitos), entidad (2 dígitos) u homoclave (3 dígitos); la posición
 * 14 (sexo) debe ser H o M. Si la ventana no describe una clave real devuelve
 * null, para no aceptar texto de otras líneas como clave.
 */
const resolveKey = (window: string): string | null => {
   if (window.length !== 18) return null;
   const head = Array.from(window.slice(0, 6), (char) =>
      /\d/.test(char) ? DIGIT_SHAPED_AS_LETTER[char] ?? "" : /[A-Z]/.test(char) ? char : ""
   ).join("");
   if (head.length !== 6) return null;
   const sex = window[14];
   if (sex !== "H" && sex !== "M") return null;
   const dates = expandDigitSlots(Array.from(window.slice(6, 12)));
   const entities = expandDigitSlots([window[12], window[13]]);
   const homoclaves = expandDigitSlots([window[15], window[16], window[17]]);
   if (!dates.length || !entities.length || !homoclaves.length) return null;
   for (const date of dates) {
      if (!isPlausibleBirthDate(date)) continue;
      for (const entity of entities) {
         if (!isPlausibleEntity(entity)) continue;
         return head + date + entity + sex + homoclaves[0];
      }
   }
   return null;
};

const findStrictElectorKey = (text: string) => {
   ELECTOR_KEY_PATTERN.lastIndex = 0;
   let match: RegExpExecArray | null;
   while ((match = ELECTOR_KEY_PATTERN.exec(text)) !== null) {
      const key = resolveKey(match[0]);
      if (key) return key;
   }
   return null;
};

/** Busca una clave de 18 caracteres en cualquier ventana del texto, tolerando errores típicos de OCR. */
const findLooseElectorKey = (text: string) => {
   const compact = compactText(text);
   for (let index = 0; index + 18 <= compact.length; index += 1) {
      const key = resolveKey(compact.slice(index, index + 18));
      if (key) return key;
   }
   return null;
};

/**
 * El PDF417 del reverso de la INE no tiene un formato público estable, pero
 * siempre incluye la Clave de Elector y, en la mayoría de modelos, la CURP.
 * Se buscan ambos patrones sobre el texto completo y sobre cada segmento.
 * Con `fuzzy` se toleran confusiones de OCR al leer el frente de la credencial.
 */
export const parseInePayload = (payload: string, options: { fuzzy?: boolean } = {}): IneScanData => {
   const raw = normalizeText(payload);

   const variants = Array.from(
      new Set([
         raw,
         raw.replace(/\s+/g, ""),
         compactText(raw),
         ...raw.split(/[|,;\r\n]+/).map((part) => compactText(part))
      ])
   );

   let electorKey: string | null = null;
   let curp: string | null = null;

   for (const text of variants) {
      electorKey ??= findStrictElectorKey(text);
      curp ??= findFirstValid(text, CURP_PATTERN, (value) => hasPlausibleDate(value, 6));
      if (electorKey && curp) break;
   }

   if (!electorKey && options.fuzzy) {
      for (const text of variants) {
         electorKey = findLooseElectorKey(text);
         if (electorKey) break;
      }
   }

   return { electorKey, curp, raw };
};

export const normalizeElectorKey = (value: string) => compactText(normalizeText(value)).slice(0, 18);

export const isValidElectorKey = (value: string) => ELECTOR_KEY_FORMAT.test(value ?? "") && hasPlausibleDate(value, 8);

export const isValidCurp = (value: string) => CURP_FORMAT.test(value ?? "");
