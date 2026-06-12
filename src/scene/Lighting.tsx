/**
 * Warm gallery base lighting. Per-artwork spotlights arrive in Phase 3;
 * no shadows yet for performance.
 */
export function Lighting() {
  return (
    <>
      <ambientLight color="#fff2e0" intensity={0.55} />
      <directionalLight
        color="#ffe8c4"
        intensity={1.1}
        position={[4, 6, 3]}
      />
      <directionalLight color="#cdd6e8" intensity={0.3} position={[-5, 4, -4]} />
      {/* warm ceiling washes along the hall */}
      <pointLight color="#ffe3b8" intensity={14} distance={14} position={[-7, 4.4, 0]} />
      <pointLight color="#ffe3b8" intensity={14} distance={14} position={[7, 4.4, 0]} />
    </>
  );
}
