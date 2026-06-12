/**
 * Light decorative props (no collision): potted plants in the atrium
 * corners and beside the wing doors. Cheap primitives, shared materials.
 */
const PLANT_SPOTS: [x: number, z: number][] = [
  [-13.5, -8.5],
  [13.5, -8.5],
  [-13.5, 8.5],
  [13.5, 8.5],
  [-1.8, 0],
  [1.8, 0],
];

function Plant({ position }: { position: [number, number] }) {
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position-y={0.3}>
        <cylinderGeometry args={[0.26, 0.34, 0.6, 10]} />
        <meshStandardMaterial color="#7a4b2e" roughness={0.8} />
      </mesh>
      <mesh position-y={0.95}>
        <sphereGeometry args={[0.42, 10, 8]} />
        <meshStandardMaterial color="#3e5c33" roughness={0.9} />
      </mesh>
      <mesh position-y={1.3}>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshStandardMaterial color="#48683a" roughness={0.9} />
      </mesh>
    </group>
  );
}

export function Props() {
  return (
    <>
      {PLANT_SPOTS.map((p, i) => (
        <Plant key={i} position={p} />
      ))}
    </>
  );
}
