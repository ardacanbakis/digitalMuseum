import { useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import type { Mesh } from "three";
import { DONATORS, FRAMES, type FrameDef } from "../../data/lobbyFrames";
import { useStore } from "../../store";
import { Frame } from "../artworks/Frame";
import { openFrame, registerFrameMesh } from "../artworks/interaction";

interface NamedSupporter {
  name: string;
  note?: string;
}

const INK = "#2b2118";
const INK_SOFT = "#6a5a3f";
const GOLD = "#7a5b1f";

/** Text content drawn onto each frame so it reads at a glance. */
function FrameContent({
  frame,
  hovered,
  supporters,
}: {
  frame: FrameDef;
  hovered: boolean;
  supporters: NamedSupporter[];
}) {
  const { width, height } = frame;
  const top = height / 2;
  const hint = (text: string) => (
    <Text
      position={[0, -top + 0.34, 0.06]}
      fontSize={0.15}
      color={hovered ? GOLD : INK_SOFT}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );

  switch (frame.kind) {
    case "welcome":
      // Brief on the wall; the full text lives in the pop-up panel.
      return hint("click for further information");

    case "donators": {
      const startY = top - 1.7;
      const step = 0.5;
      return (
        <>
          <Text
            position={[0, top - 1.15, 0.06]}
            fontSize={0.18}
            color={INK_SOFT}
            anchorX="center"
            anchorY="middle"
          >
            Thank you to those who keep this museum open
          </Text>
          {supporters.slice(0, 5).map((d, i) => (
            <Text
              key={i}
              position={[0, startY - i * step, 0.06]}
              fontSize={0.3}
              maxWidth={width * 0.9}
              textAlign="center"
              color={INK}
              anchorX="center"
              anchorY="middle"
            >
              {d.note ? `${d.name}  ·  ${d.note}` : d.name}
            </Text>
          ))}
        </>
      );
    }

    case "credits":
      // Compact: title + invitation only.
      return hint("Click me!");

    case "guestbook":
      return (
        <>
          <Text
            position={[0, top - 1.1, 0.06]}
            fontSize={0.2}
            maxWidth={width * 0.85}
            textAlign="center"
            color={INK}
            anchorX="center"
            anchorY="top"
          >
            Leave a note for future visitors
          </Text>
          {hint("click to sign & read")}
        </>
      );

    default:
      return null;
  }
}

function InfoFrame({ frame }: { frame: FrameDef }) {
  const hovered = useStore((s) => s.hoveredFrame === frame.id);
  const stored = useStore((s) => s.supporters);
  const supporters: NamedSupporter[] = stored.length ? stored : DONATORS;
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    return registerFrameMesh(meshRef.current, frame.id);
  }, [frame.id]);

  const { width, height } = frame;

  return (
    <group position={frame.position} rotation-y={frame.rotationY}>
      <Frame width={width} height={height} hovered={hovered} />
      <mesh
        ref={meshRef}
        position-z={0.04}
        onClick={(e) => {
          e.stopPropagation();
          if (document.pointerLockElement || e.delta > 5) return;
          if (useStore.getState().viewMode === "walking") openFrame(frame.id);
        }}
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#efe7d4" roughness={0.9} />
      </mesh>
      <Text
        position={[0, height / 2 - 0.28, 0.06]}
        fontSize={Math.min(0.4, width * 0.09)}
        maxWidth={width * 0.9}
        textAlign="center"
        anchorX="center"
        anchorY="top"
        color={INK}
        outlineWidth={0.004}
        outlineColor="#d8cba8"
      >
        {frame.title}
      </Text>
      <FrameContent frame={frame} hovered={hovered} supporters={supporters} />
    </group>
  );
}

/** The atrium's welcome / supporters / credits / guest-book frames. */
export function InfoFrames() {
  return (
    <>
      {FRAMES.map((f) => (
        <InfoFrame key={f.id} frame={f} />
      ))}
    </>
  );
}
