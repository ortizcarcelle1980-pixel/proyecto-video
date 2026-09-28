import { CalculateMetadataFunction, Composition } from "remotion";
import { CaminoASiamTemplate } from "./CaminoASiamTemplate";
import { clips, FPS, outroDurationInSeconds } from "./clips";

type Props = {};

// Calcula automáticamente la duración total del vídeo sumando
// la duración de cada clip (definida en src/clips.ts) + el cierre.
const calculateMetadata: CalculateMetadataFunction<Props> = async () => {
  const clipsSeconds = clips.reduce(
    (total, clip) => total + clip.durationInSeconds,
    0,
  );
  const totalSeconds = clipsSeconds + outroDurationInSeconds;

  return {
    durationInFrames: Math.max(1, Math.round(totalSeconds * FPS)),
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
      calculateMetadata={calculateMetadata}
    />
  );
};
