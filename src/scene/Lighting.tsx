/**
 * Warm gallery base lighting for the whole museum. Per-artwork spotlights
 * and a real lighting pass come in Phase 5; no shadows for performance.
 * Paintings are unlit (meshBasicMaterial), so this shapes walls and props.
 */
export function Lighting() {
  return (
    <>
      <ambientLight color="#fff2e0" intensity={0.65} />
      <hemisphereLight color="#fff6e6" groundColor="#5a4a38" intensity={0.5} />
      <directionalLight color="#ffe8c4" intensity={0.9} position={[6, 10, 4]} />
      <directionalLight
        color="#cdd6e8"
        intensity={0.25}
        position={[-8, 8, -6]}
      />
    </>
  );
}
