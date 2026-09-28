// ============================================================
// Genera public/subtitulos.json a partir del vídeo en public/
// ============================================================
// Uso: npm run subtitulos
//
// Qué hace, paso a paso:
// 1. Instala whisper.cpp (solo la primera vez).
// 2. Descarga el modelo de español (solo la primera vez).
// 3. Extrae el audio del vídeo a un .wav temporal.
// 4. Transcribe ese audio, palabra por palabra con su tiempo exacto.
// 5. Corrige las palabras del canal (Gao Yord, yant, Meru, Sak Yant).
// 6. Guarda el resultado en public/subtitulos.json.
//
// La primera vez tarda varios minutos (instalar + descargar modelo).
// Las siguientes veces solo tarda lo que tarde la transcripción.

import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import {
  WHISPER_LANG,
  WHISPER_MODEL,
  WHISPER_PATH,
  WHISPER_VERSION,
  SUBTITLES_OUTPUT_FILE,
} from "./whisper-config.mjs";
import { correctCaptions } from "./subtitle-corrections.mjs";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".mkv"];
const PUBLIC_DIR = path.join(process.cwd(), "public");
const TEMP_DIR = path.join(process.cwd(), "temp");

const findVideoFile = () => {
  if (!existsSync(PUBLIC_DIR)) {
    console.error('No existe la carpeta "public/". Créala y añade tu vídeo.');
    process.exit(1);
  }

  const videoFiles = readdirSync(PUBLIC_DIR)
    .filter((name) =>
      VIDEO_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
    )
    .sort((a, b) => a.localeCompare(b));

  if (videoFiles.length === 0) {
    console.error(
      'No he encontrado ningún vídeo (.mp4/.mov/.webm/.mkv) dentro de "public/".',
    );
    console.error("Copia ahí tu vídeo y vuelve a ejecutar: npm run subtitulos");
    process.exit(1);
  }

  if (videoFiles.length > 1) {
    console.warn(
      `Aviso: hay ${videoFiles.length} vídeos en public/ (${videoFiles.join(", ")}).`,
    );
    console.warn(
      `Este script solo transcribe uno. Voy a usar: "${videoFiles[0]}".`,
    );
  }

  return path.join(PUBLIC_DIR, videoFiles[0]);
};

const extractAudioToWav = (videoPath, wavPath) => {
  console.log("Extrayendo audio del vídeo...");
  execSync(`npx remotion ffmpeg -i "${videoPath}" -ar 16000 "${wavPath}" -y`, {
    stdio: ["ignore", "inherit", "inherit"],
  });
};

const main = async () => {
  const videoPath = findVideoFile();
  console.log(`Vídeo a transcribir: ${path.relative(process.cwd(), videoPath)}`);

  console.log("\nInstalando whisper.cpp (si no estaba ya instalado)...");
  await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });

  console.log(`Descargando modelo "${WHISPER_MODEL}" (si no estaba ya descargado)...`);
  await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

  let removeTempDir = false;
  if (!existsSync(TEMP_DIR)) {
    mkdirSync(TEMP_DIR);
    removeTempDir = true;
  }

  const wavPath = path.join(TEMP_DIR, "audio.wav");
  extractAudioToWav(videoPath, wavPath);

  console.log("\nTranscribiendo (esto puede tardar varios minutos)...");
  const whisperCppOutput = await transcribe({
    inputPath: wavPath,
    model: WHISPER_MODEL,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    whisperCppVersion: WHISPER_VERSION,
    printOutput: false,
    translateToEnglish: false,
    language: WHISPER_LANG,
    splitOnWord: true,
  });

  const { captions } = toCaptions({ whisperCppOutput });
  const correctedCaptions = correctCaptions(captions);

  writeFileSync(SUBTITLES_OUTPUT_FILE, JSON.stringify(correctedCaptions, null, 2));

  if (removeTempDir) {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  console.log(
    `\nListo. Subtítulos guardados en: ${path.relative(process.cwd(), SUBTITLES_OUTPUT_FILE)}`,
  );
  console.log(
    "Revisa el archivo: si alguna palabra del canal sigue mal escrita, añade la variante en subtitle-corrections.mjs.",
  );
};

main().catch((err) => {
  console.error("\nAlgo falló generando los subtítulos:");
  console.error(err);
  process.exit(1);
});
