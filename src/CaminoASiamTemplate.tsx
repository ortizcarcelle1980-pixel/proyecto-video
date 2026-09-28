import type { Caption } from "@remotion/captions";
import React from "react";
import {
  AbsoluteFill,
  cancelRender,
  getStaticFiles,
  interpolate,
  OffthreadVideo,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  watchStaticFile,
} from "remotion";
import {
  channelHandle,
  channelName,
  FPS,
  outroDurationInSeconds,
  subtitledClips,
  subtitleWordsPerPage,
  subtitlesFile,
  upperThirdCues,
  UpperThirdCue,
} from "./clips";

export type ResolvedClip = {
  src: string;
  name: string;
  durationInSeconds: number;
  text?: string;
};

// ============================================================
// Texto grande del tercio superior
// ============================================================
const UpperThirdText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 170,
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.15,
          color: "white",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          maxWidth: "88%",
          WebkitTextStroke: "9px black",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Subtítulo estilo Reels (2-4 palabras, centrado bajo la mitad)
// ============================================================
const SubtitleText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: "58%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "88%",
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 60,
          lineHeight: 1.25,
          color: "white",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          WebkitTextStroke: "8px black",
          paintOrder: "stroke fill",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const durationInFrames = outroDurationInSeconds * FPS;
  const fadeFrames = Math.min(12, Math.floor(durationInFrames / 4));

  const opacity = interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div
          style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontWeight: 900,
            fontSize: 84,
            color: "white",
            textAlign: "center",
            WebkitTextStroke: "9px black",
            paintOrder: "stroke fill",
          }}
        >
          {channelName}
        </div>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 40,
            color: "white",
            textAlign: "center",
          }}
        >
          {channelHandle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const EmptyState: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 34,
          color: "white",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        No se encuentra ningún vídeo en{"\n"}
        <b>public/</b>
        {"\n\n"}
        Copia ahí tu(s) archivo(s) .mp4 y{"\n"}
        recarga esta ventana.
      </div>
    </AbsoluteFill>
  );
};

const ClipErrorState: React.FC<{ name: string }> = ({ name }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#3a0d0d",
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: 30,
          color: "white",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        No se pudo reproducir{"\n"}
        <b>{name}</b>
        {"\n\n"}
        Comprueba que el archivo no esté{"\n"}
        dañado y que sea un formato de{"\n"}
        vídeo compatible (mp4/mov/webm).
      </div>
    </AbsoluteFill>
  );
};

// ============================================================
// Carga public/subtitulos.json (con recarga automática si lo
// regeneras mientras el Estudio está abierto).
// ============================================================
const useSubtitleCaptions = (): Caption[] => {
  const [captions, setCaptions] = React.useState<Caption[]>([]);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = React.useState(() =>
    delayRender("Cargando public/subtitulos.json"),
  );

  const subtitlesExist = React.useCallback(() => {
    return getStaticFiles().some((file) => file.name === subtitlesFile);
  }, []);

  const fetchCaptions = React.useCallback(async () => {
    try {
      if (!subtitlesExist()) {
        setCaptions([]);
        continueRender(handle);
        return;
      }
      const response = await fetch(staticFile(subtitlesFile));
      const data = (await response.json()) as Caption[];
      setCaptions(data);
      continueRender(handle);
    } catch (err) {
      cancelRender(err);
    }
  }, [continueRender, handle, subtitlesExist]);

  React.useEffect(() => {
    fetchCaptions();
    const watcher = watchStaticFile(subtitlesFile, () => {
      fetchCaptions();
    });
    return () => watcher.cancel();
  }, [fetchCaptions]);

  return captions;
};

// Agrupa las palabras en páginas de N palabras (subtítulo estilo Reels).
const groupWordsIntoPages = (
  words: Caption[],
  wordsPerPage: number,
): { text: string; startMs: number; endMs: number }[] => {
  const pages: { text: string; startMs: number; endMs: number }[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    const chunk = words.slice(i, i + wordsPerPage);
    if (chunk.length === 0) continue;
    pages.push({
      text: chunk.map((word) => word.text).join("").trim(),
      startMs: chunk[0].startMs,
      endMs: chunk[chunk.length - 1].endMs,
    });
  }
  return pages;
};

type ResolvedUpperThirdCue = { text: string; startMs: number; endMs: number };

// Los tokens de whisper suelen traer puntuación pegada ("Meru.",
// "cintura,"), así que para comparar contra una palabra clave hay
// que quitarla primero (si no, "Meru." nunca sería igual a "Meru").
const stripPunctuation = (text: string) =>
  text.trim().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

// Resuelve la configuración de upperThirdCues (tiempo fijo o
// "primera vez que aparece esta palabra") a tiempos reales,
// usando las palabras transcritas. Cada texto dura hasta que
// empieza el siguiente.
const resolveUpperThirdCues = (
  cueConfigs: UpperThirdCue[],
  words: Caption[],
  clipDurationInSeconds: number,
): ResolvedUpperThirdCue[] => {
  const results: ResolvedUpperThirdCue[] = [];

  const introCue = cueConfigs.find(
    (cue): cue is Extract<UpperThirdCue, { type: "time" }> =>
      cue.type === "time",
  );
  const introEndMs = introCue ? introCue.toSeconds * 1000 : 0;

  if (introCue) {
    results.push({
      text: introCue.text,
      startMs: introCue.fromSeconds * 1000,
      endMs: introCue.toSeconds * 1000,
    });
  }

  const wordCues = cueConfigs.filter(
    (cue): cue is Extract<UpperThirdCue, { type: "onFirstWord" }> =>
      cue.type === "onFirstWord",
  );

  const timedWordCues = wordCues
    .map((cue) => {
      const targets = cue.words.map((word) => word.toLowerCase());
      const match = words.find((word) =>
        targets.includes(stripPunctuation(word.text).toLowerCase()),
      );
      return match ? { text: cue.text, startMs: match.startMs } : null;
    })
    .filter((cue): cue is { text: string; startMs: number } => cue !== null)
    .sort((a, b) => a.startMs - b.startMs);

  for (let i = 0; i < timedWordCues.length; i++) {
    const startMs = Math.max(timedWordCues[i].startMs, introEndMs);
    const nextStartMs =
      i + 1 < timedWordCues.length
        ? timedWordCues[i + 1].startMs
        : clipDurationInSeconds * 1000;
    const endMs = Math.max(nextStartMs, startMs);
    if (endMs <= startMs) continue;
    results.push({ text: timedWordCues[i].text, startMs, endMs });
  }

  return results;
};

const SubtitledVideo: React.FC<{ clip: ResolvedClip }> = ({ clip }) => {
  const captions = useSubtitleCaptions();

  const subtitlePages = React.useMemo(
    () => groupWordsIntoPages(captions, subtitleWordsPerPage),
    [captions],
  );

  const resolvedCues = React.useMemo(
    () =>
      resolveUpperThirdCues(
        upperThirdCues[clip.name] ?? [],
        captions,
        clip.durationInSeconds,
      ),
    [clip.name, captions, clip.durationInSeconds],
  );

  return (
    <VideoClip clip={clip}>
      {subtitlePages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * FPS);
        const endFrame = Math.round((page.endMs / 1000) * FPS);
        const durationInFrames = Math.max(1, endFrame - startFrame);
        return (
          <Sequence
            key={`subtitle-${index}`}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <SubtitleText text={page.text} />
          </Sequence>
        );
      })}
      {resolvedCues.map((cue, index) => {
        const startFrame = Math.round((cue.startMs / 1000) * FPS);
        const endFrame = Math.round((cue.endMs / 1000) * FPS);
        const durationInFrames = Math.max(1, endFrame - startFrame);
        return (
          <Sequence
            key={`cue-${index}`}
            from={startFrame}
            durationInFrames={durationInFrames}
            layout="none"
          >
            <UpperThirdText text={cue.text} />
          </Sequence>
        );
      })}
    </VideoClip>
  );
};

const VideoClip: React.FC<{
  clip: ResolvedClip;
  children?: React.ReactNode;
}> = ({ clip, children }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <ClipErrorState name={clip.name} />;
  }

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={clip.src}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      {children}
      {!children && clip.text ? <UpperThirdText text={clip.text} /> : null}
    </AbsoluteFill>
  );
};

export const CaminoASiamTemplate: React.FC<{
  clips: ResolvedClip[];
}> = ({ clips }) => {
  if (clips.length === 0) {
    return (
      <AbsoluteFill>
        <EmptyState />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {clips.map((clip, index) => (
          <Series.Sequence
            key={`${clip.src}-${index}`}
            durationInFrames={Math.max(
              1,
              Math.round(clip.durationInSeconds * FPS),
            )}
          >
            {subtitledClips[clip.name] ? (
              <SubtitledVideo clip={clip} />
            ) : (
              <VideoClip clip={clip} />
            )}
          </Series.Sequence>
        ))}
        <Series.Sequence
          durationInFrames={Math.round(outroDurationInSeconds * FPS)}
        >
          <Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
