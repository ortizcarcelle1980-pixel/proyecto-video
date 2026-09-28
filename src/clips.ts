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
// Aquí abajo solo defines, opcionalmente, el TEXTO que quieres que
// aparezca encima de cada clip. La clave tiene que ser el nombre
// exacto del archivo (tal como lo pusiste en public/).

export const textOverrides: Record<string, string> = {
  // "01-intro.mp4": "ASÍ EMPEZÓ\nEL VIAJE",
  // "02-tatuaje.mp4": "LA BENDICIÓN\nDEL AJARN",
};

// Nombre del canal que aparece en el cierre.
export const channelName = "CAMINO A SIAM";

// Duración del cierre final (segundos).
export const outroDurationInSeconds = 2;

export const FPS = 30;

// Extensiones de vídeo que se detectan automáticamente en public/.
export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".m4v"];
