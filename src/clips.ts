// ============================================================
// PLANTILLA "CAMINO A SIAM" — configuración de clips y textos
// ============================================================
// Este es el único archivo que necesitas tocar para montar un vídeo:
// - Añade tus clips (en orden) con su duración y su texto.
// - Los vídeos deben estar dentro de la carpeta `public/`
//   (ej: si pones `public/clip1.mp4`, aquí escribes src: "clip1.mp4").
// - `durationInSeconds` es cuánto dura ESE CLIP en el vídeo final
//   (no tiene que ser la duración completa del archivo original:
//   se recorta desde el segundo 0 del clip).
// - `text` es opcional. Si lo dejas vacío o lo borras, el clip
//   se reproduce sin texto encima. Usa "\n" para partir en dos líneas.

export const FPS = 30;

export type ClipConfig = {
  src: string;
  durationInSeconds: number;
  text?: string;
};

export const clips: ClipConfig[] = [
  // video1.mp4 ya es un montaje completo (con sus propios subtítulos
  // incrustados), así que aquí no le añadimos texto para no duplicarlo.
  // Su duración es la del propio vídeo editado.
  { src: "video1.mp4", durationInSeconds: 29.5 },
];

// Nombre del canal que aparece en el cierre.
export const channelName = "CAMINO A SIAM";

// Duración del cierre final (segundos).
export const outroDurationInSeconds = 2;
