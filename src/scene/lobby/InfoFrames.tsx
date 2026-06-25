import { useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import type { Mesh } from "three";
import { FRAMES, type FrameDef } from "../../data/lobbyFrames";
import { useStore } from "../../store";
import { Frame } from "../artworks/Frame";
import { openFrame, registerFrameMesh } from "../artworks/interaction";

function InfoFrame({ frame }: { frame: FrameDef }) {
  const hovered = useStore((s) => s.hoveredFrame === frame.id);
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
        position={[0, height / 2 - 0.45, 0.06]}
        fontSize={Math.min(0.4, width * 0.085)}
        maxWidth={width * 0.9}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#2b2118"
      >
        {frame.title}
      </Text>
      <Text
        position={[0, -height / 2 + 0.4, 0.06]}
        fontSize={0.16}
        color={hovered ? "#7a5b1f" : "#8a7a5c"}
        anchorX="center"
        anchorY="middle"
      >
        {hovered ? "click to read" : "·  ·  ·"}
      </Text>
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
