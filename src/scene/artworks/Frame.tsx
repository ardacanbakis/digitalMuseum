const THICKNESS = 0.07;
const DEPTH = 0.06;

/**
 * Procedural picture frame: four bars + backboard around the canvas.
 * One gilded style for now; era-specific styles come in Phase 5.
 */
export function Frame({
  width,
  height,
  hovered,
}: {
  width: number;
  height: number;
  hovered: boolean;
}) {
  const t = THICKNESS;
  const emissive = hovered ? "#6b5212" : "#000000";
  const bars: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2 + t / 2, DEPTH / 2], size: [width + t * 2, t, DEPTH] },
    { position: [0, -height / 2 - t / 2, DEPTH / 2], size: [width + t * 2, t, DEPTH] },
    { position: [-width / 2 - t / 2, 0, DEPTH / 2], size: [t, height, DEPTH] },
    { position: [width / 2 + t / 2, 0, DEPTH / 2], size: [t, height, DEPTH] },
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
            color="#9a7b3f"
            metalness={0.35}
            roughness={0.45}
            emissive={emissive}
          />
        </mesh>
      ))}
    </group>
  );
}
