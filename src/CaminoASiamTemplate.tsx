import React from "react";
import { AbsoluteFill, OffthreadVideo, Series } from "remotion";
import { channelName, outroDurationInSeconds, FPS } from "./clips";

export type ResolvedClip = {
  src: string;
  name: string;
  durationInSeconds: number;
  text?: string;
};

// Texto grande, blanco, con borde negro, en el tercio superior.
// Para cambiar el estilo del texto (tamaño, color, grosor del borde),
// edita los valores de este componente.
const OverlayText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 170, // separa el texto del borde superior
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 72,
          lineHeight: 1.15,
          color: "white",
          textAlign: "center",
          textTransform: "uppercase",
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

const Outro: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontWeight: 900,
          fontSize: 88,
          color: "white",
          textAlign: "center",
          textTransform: "uppercase",
          WebkitTextStroke: "9px black",
          paintOrder: "stroke fill",
        }}
      >
        {channelName}
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
        <b>public/</b>{"\n\n"}
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

const VideoClip: React.FC<{ clip: ResolvedClip }> = ({ clip }) => {
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
      {clip.text ? <OverlayText text={clip.text} /> : null}
    </AbsoluteFill>
  );
};

export const CaminoASiamTemplate: React.FC<{ clips: ResolvedClip[] }> = ({
  clips,
}) => {
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
            <VideoClip clip={clip} />
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
