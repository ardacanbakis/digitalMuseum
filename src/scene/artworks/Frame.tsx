import type { RoomId } from "../../data/types";

interface FrameStyle {
  color: string;
  thickness: number;
  depth: number;
  metalness: number;
  roughness: number;
}

/** One frame profile per era — heavy gilt for the old masters, thin and
 * minimal for the moderns. */
const FRAME_STYLES: Partial<Record<RoomId, FrameStyle>> = {
  renaissance: { color: "#a3792f", thickness: 0.12, depth: 0.085, metalness: 0.45, roughness: 0.4 },
  baroque: { color: "#4a331f", thickness: 0.11, depth: 0.075, metalness: 0.2, roughness: 0.55 },
  romanticism: { color: "#8a6d3b", thickness: 0.09, depth: 0.065, metalness: 0.35, roughness: 0.45 },
  impressionism: { color: "#9a7b3f", thickness: 0.07, depth: 0.06, metalness: 0.35, roughness: 0.45 },
  modern: { color: "#e8e4dc", thickness: 0.04, depth: 0.035, metalness: 0.05, roughness: 0.7 },
};

const DEFAULT_STYLE: FrameStyle = {
  color: "#9a7b3f",
  thickness: 0.07,
  depth: 0.06,
  metalness: 0.35,
  roughness: 0.45,
};

/**
 * Procedural picture frame: four bars + backboard around the canvas,
 * styled by era.
 */
export function Frame({
  width,
  height,
  hovered,
  room,
}: {
  width: number;
  height: number;
  hovered: boolean;
  room?: RoomId;
}) {
  const style = (room && FRAME_STYLES[room]) || DEFAULT_STYLE;
  const t = style.thickness;
  const d = style.depth;
  const emissive = hovered ? "#6b5212" : "#000000";
  const bars: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2 + t / 2, d / 2], size: [width + t * 2, t, d] },
    { position: [0, -height / 2 - t / 2, d / 2], size: [width + t * 2, t, d] },
    { position: [-width / 2 - t / 2, 0, d / 2], size: [t, height, d] },
    { position: [width / 2 + t / 2, 0, d / 2], size: [t, height, d] },
  ];
  return (
    <group>
      {/* backboard behind the canvas */}
      <mesh position-z={0.005}>
        <boxGeometry args={[width + t * 2, height + t * 2, 0.01]} />
        <meshStandardMaterial color="#26201a" />
      </mesh>
      {bars.map((bar, i) => (
        <mesh key={i} position={bar.position}>
          <boxGeometry args={bar.size} />
          <meshStandardMaterial
            color={style.color}
            metalness={style.metalness}
            roughness={style.roughness}
            emissive={emissive}
          />
        </mesh>
      ))}
    </group>
  );
}
