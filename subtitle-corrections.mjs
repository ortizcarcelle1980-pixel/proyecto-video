// ============================================================
// Corrección de palabras específicas del canal "Camino a Siam"
// ============================================================
// Whisper transcribe por oído, así que términos poco comunes (sobre
// todo palabras tailandesas) suele escribirlos mal o partirlos raro.
// Este archivo corrige, después de transcribir, las palabras que nos
// interesa que salgan siempre bien: "Gao Yord", "yant", "Meru" y
// "Sak Yant".
//
// Si un día ves en public/subtitulos.json que alguna de estas
// palabras sigue saliendo mal escrita, añade aquí la variante que
// haya escrito Whisper (mira el texto exacto en el JSON) siguiendo
// el mismo patrón que las de abajo.

// Correcciones que fusionan DOS palabras seguidas en una sola
// (Whisper suele partir "Gao Yord" y "Sak Yant" en dos tokens).
const TWO_WORD_CORRECTIONS = [
  {
    first: /^g[ae]?ll?[oa]?$/i,
    second: /^y+[oó]r+d?$/i,
    replacement: "Gao Yord",
  },
  {
    first: /^ca[oa]$/i,
    second: /^y+[oó]r+d?$/i,
    replacement: "Gao Yord",
  },
  {
    first: /^sak?a?$/i,
    second: /^y+ant?e?$/i,
    replacement: "Sak Yant",
  },
];

// Correcciones de una sola palabra.
const ONE_WORD_CORRECTIONS = [
  { pattern: /^y+ant?e?$/i, replacement: "yant" },
  { pattern: /^ll+ant?e?$/i, replacement: "yant" },
  { pattern: /^me?r+u?$/i, replacement: "Meru" },
  { pattern: /^mel+u?$/i, replacement: "Meru" },
];

// Los tokens de whisper suelen venir con un espacio delante
// (" Gao") y a veces con puntuación pegada detrás ("Yante.",
// "sagrado,"). Estas funciones separan esas tres partes para poder
// comparar solo la palabra "limpia" contra los patrones de arriba,
// y luego reconstruir el texto conservando espacio y puntuación
// originales.
const LEADING_SPACE = /^\s/;
const TRAILING_PUNCTUATION = /[^\p{L}\p{N}\s]+$/u;
const SURROUNDING_PUNCTUATION = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

const getLeadingSpace = (text) => (LEADING_SPACE.test(text) ? " " : "");
const getTrailingPunctuation = (text) => {
  const match = text.trim().match(TRAILING_PUNCTUATION);
  return match ? match[0] : "";
};
const getCoreWord = (text) => text.trim().replace(SURROUNDING_PUNCTUATION, "");

const buildReplacement = (originalText, replacement, trailingFrom) => {
  return `${getLeadingSpace(originalText)}${replacement}${getTrailingPunctuation(trailingFrom)}`;
};

export const correctCaptions = (captions) => {
  const result = [];

  for (let i = 0; i < captions.length; i++) {
    const current = captions[i];
    const next = captions[i + 1];

    if (next) {
      const currentWord = getCoreWord(current.text);
      const nextWord = getCoreWord(next.text);
      const twoWordMatch = TWO_WORD_CORRECTIONS.find(
        (correction) =>
          correction.first.test(currentWord) &&
          correction.second.test(nextWord),
      );

      if (twoWordMatch) {
        result.push({
          ...current,
          text: buildReplacement(current.text, twoWordMatch.replacement, next.text),
          endMs: next.endMs,
        });
        i += 1; // saltamos el segundo token, ya está fusionado
        continue;
      }
    }

    const word = getCoreWord(current.text);
    const oneWordMatch = ONE_WORD_CORRECTIONS.find((correction) =>
      correction.pattern.test(word),
    );

    if (oneWordMatch) {
      result.push({
        ...current,
        text: buildReplacement(current.text, oneWordMatch.replacement, current.text),
      });
      continue;
    }

    result.push(current);
  }

  return result;
};
