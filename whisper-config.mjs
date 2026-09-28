import path from "node:path";

// Carpeta donde se instala whisper.cpp (se crea la primera vez que
// ejecutas "npm run subtitulos"; no hace falta tocarla).
export const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");

// Versión de whisper.cpp a instalar.
export const WHISPER_VERSION = "1.6.0";

// Modelo a usar. Cuanto más grande, más preciso pero más lento y
// más pesado de descargar la primera vez.
// | Modelo    | Disco  | Memoria |
// |-----------|--------|---------|
// | small     | 466 MB | ~1.0 GB |
// | medium    | 1.5 GB | ~2.6 GB | <- por defecto: mejor precisión
// | large-v3  | 2.9 GB | ~4.7 GB |
//
// Nota: para español NO uses los modelos terminados en ".en"
// (esos son solo para inglés).
/**
 * @type {import('@remotion/install-whisper-cpp').WhisperModel}
 */
export const WHISPER_MODEL = "medium";

// Idioma del audio a transcribir.
/**
 * @type {import('@remotion/install-whisper-cpp').Language}
 */
export const WHISPER_LANG = "Spanish";

// Dónde se guarda el resultado final (subtítulos ya corregidos).
export const SUBTITLES_OUTPUT_FILE = path.join(
  process.cwd(),
  "public",
  "subtitulos.json",
);

// Dónde se guarda la duración exacta del vídeo (medida con ffprobe,
// no con el navegador: el navegador a veces calcula mal la duración
// de vídeos exportados desde apps de edición). La composición lee
// este archivo para no depender de esa detección poco fiable.
export const DURATION_OUTPUT_FILE = path.join(
  process.cwd(),
  "public",
  "duracion.json",
);
