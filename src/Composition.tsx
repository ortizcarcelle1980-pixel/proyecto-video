import { getVideoMetadata } from "@remotion/media-utils";
import {
  CalculateMetadataFunction,
  Composition,
  getStaticFiles,
  staticFile,
} from "remotion";
import { CaminoASiamTemplate, ResolvedClip } from "./CaminoASiamTemplate";
import {
  durationOverridesFile,
  FPS,
  outroDurationInSeconds,
  textOverrides,
  VIDEO_EXTENSIONS,
} from "./clips";

type Props = {
  clips: ResolvedClip[];
};

// Lee public/duracion.json si existe (lo genera "npm run
// subtitulos" con ffprobe, mucho más fiable que dejar que el
// navegador calcule la duración de un vídeo).
const loadDurationOverrides = async (): Promise<Record<string, number>> => {
  const exists = getStaticFiles().some(
    (file) => file.name === durationOverridesFile,
  );
  if (!exists) {
    return {};
  }
  try {
    const response = await fetch(staticFile(durationOverridesFile));
    return (await response.json()) as Record<string, number>;
  } catch (err) {
    console.warn(`No se pudo leer ${durationOverridesFile}:`, err);
    return {};
  }
};

// Detecta automáticamente los vídeos que hay en public/, lee la
// duración real de cada uno y calcula la duración total del vídeo.
const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const videoFiles = getStaticFiles()
    .filter((file) =>
      VIDEO_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const durationOverrides = await loadDurationOverrides();

  // Si algún vídeo no se puede leer (archivo dañado, formato raro,
  // etc.) no debe tirar abajo el resto del montaje: le damos una
  // duración de reserva y dejamos que sea el propio clip, al
  // reproducirse, el que muestre el aviso de error (ver
  // CaminoASiamTemplate -> VideoClip).
  const FALLBACK_DURATION_SECONDS = 5;

  const resolvedClips: ResolvedClip[] = await Promise.all(
    videoFiles.map(async (file) => {
      const overrideDuration = durationOverrides[file.name];
      if (typeof overrideDuration === "number") {
        return {
          src: file.src,
          name: file.name,
          durationInSeconds: overrideDuration,
          text: textOverrides[file.name],
        };
      }

      try {
        const metadata = await getVideoMetadata(file.src);
        return {
          src: file.src,
          name: file.name,
          durationInSeconds: metadata.durationInSeconds,
          text: textOverrides[file.name],
        };
      } catch (err) {
        console.warn(
          `No se pudo leer la duración de "${file.name}", uso ${FALLBACK_DURATION_SECONDS}s de reserva.`,
          err,
        );
        return {
          src: file.src,
          name: file.name,
          durationInSeconds: FALLBACK_DURATION_SECONDS,
          text: textOverrides[file.name],
        };
      }
    }),
  );

  const clipsSeconds = resolvedClips.reduce(
    (total, clip) => total + clip.durationInSeconds,
    0,
  );
  const totalSeconds = clipsSeconds + outroDurationInSeconds;

  return {
    durationInFrames: Math.max(1, Math.round(totalSeconds * FPS)),
    props: { clips: resolvedClips },
  };
};

export const MyComposition = () => {
  return (
    <Composition
      id="CaminoASiam"
      component={CaminoASiamTemplate}
      durationInFrames={FPS * outroDurationInSeconds}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={{ clips: [] as ResolvedClip[] }}
      calculateMetadata={calculateMetadata}
    />
  );
};
