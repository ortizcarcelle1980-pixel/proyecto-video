import React from "react";
import { AbsoluteFill, OffthreadVideo, Series, staticFile } from "remotion";
import { channelName, clips, FPS, outroDurationInSeconds } from "./clips";

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
        Añade tus clips en{"\n"}
        <b>public/</b> y edítalos en{"\n"}
        <b>src/clips.ts</b>
      </div>
    </AbsoluteFill>
  );
};

export const CaminoASiamTemplate: React.FC = () => {
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
            durationInFrames={Math.round(clip.durationInSeconds * FPS)}
          >
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(clip.src)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {clip.text ? <OverlayText text={clip.text} /> : null}
            </AbsoluteFill>
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
