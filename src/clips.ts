// ============================================================
// PLANTILLA "CAMINO A SIAM" — textos y ajustes
// ============================================================
// Los clips se detectan AUTOMÁTICAMENTE a partir de lo que haya en
// `public/` — no hace falta escribir el nombre del archivo en ningún
// sitio. Cualquier vídeo (.mp4, .mov, .webm, .m4v) que metas ahí
// aparece en el vídeo final, en orden alfabético por nombre de
// archivo. Para controlar el orden, nombra tus archivos con un
// número delante:
//
//   public/01-intro.mp4
//   public/02-tatuaje.mp4
//   public/03-cierre.mp4
//
// Aquí abajo defines, opcionalmente, el TEXTO simple que quieres que
// aparezca encima de cada clip (para vídeos sin subtítulos). La
// clave tiene que ser el nombre exacto del archivo.

export const textOverrides: Record<string, string> = {
  // "02-tatuaje.mp4": "LA BENDICIÓN\nDEL AJARN",
};

// Nombre del canal que aparece en el cierre.
export const channelName = "CAMINO A SIAM";
export const channelHandle = "@caminoasiam";

// Duración del cierre final (segundos).
export const outroDurationInSeconds = 2;

export const FPS = 30;

// Extensiones de vídeo que se detectan automáticamente en public/.
export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];

// ============================================================
// Subtítulos automáticos (estilo Reels)
// ============================================================
// Nombre del archivo de subtítulos que genera "npm run subtitulos".
export const subtitlesFile = "subtitulos.json";

// Cuántas palabras se muestran a la vez en el subtítulo (2-4 recomendado).
export const subtitleWordsPerPage = 3;

// Qué clips llevan subtítulos + textos superiores dinámicos.
// Los clips que NO estén aquí usan el texto simple de textOverrides
// de arriba (o ninguno).
export const subtitledClips: Record<string, boolean> = {
  "01-gaoyord.mp4": true,
};

// ============================================================
// Textos grandes del tercio superior, disparados por tiempo o por
// la primera vez que aparece una palabra en la transcripción.
// ============================================================
export type UpperThirdCue =
  | { type: "time"; fromSeconds: number; toSeconds: number; text: string }
  | { type: "onFirstWord"; words: string[]; text: string };

export const upperThirdCues: Record<string, UpperThirdCue[]> = {
  "01-gaoyord.mp4": [
    {
      type: "time",
      fromSeconds: 0,
      toSeconds: 3,
      text: "29 puntas en la espalda.\nYo lo hice el último.",
    },
    {
      type: "onFirstWord",
      words: ["Gao Yord"],
      text: "GAO YORD = yant maestro",
    },
    {
      type: "onFirstWord",
      words: ["Meru"],
      text: "9 picos = monte Meru",
    },
    {
      type: "onFirstWord",
      // Whisper a veces transcribe los números como dígitos ("29")
      // en vez de con letras ("veintinueve"): comprobamos las dos.
      words: ["veintinueve", "29"],
      text: "9 + 20 = 29",
    },
    {
      type: "onFirstWord",
      words: ["cintura"],
      text: "Siempre arriba",
    },
    {
      type: "onFirstWord",
      words: ["tigre"],
      text: "Próximo: el tigre 🐅",
    },
  ],
};
