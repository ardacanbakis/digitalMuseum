import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group, type Mesh } from "three";
import type { ArtworkEntry } from "../../data/types";
import { useStore } from "../../store";
import { Frame } from "./Frame";
import { registerArtworkMesh, selectArtwork } from "./interaction";
import { computeFocusPose, paintingSize, type Placement } from "./layout";
import { useImageTexture } from "./useImageTexture";

const POP_DAMPING = 6; // pop-out/return animation speed
const MAX_DELTA = 0.05;

export function Painting({
  entry,
  placement,
}: {
  entry: ArtworkEntry;
  placement: Placement;
}) {
  const id = entry.wikidataId;
  const art = useStore((s) => s.artworkData[id]?.data);
  const selected = useStore((s) => s.selectedArtwork === id);
  const hovered = useStore((s) => s.hoveredArtwork === id);

  const loUrl = art?.imageUrlSmall ?? art?.thumbnailUrl;
  const hiUrl = art?.imageUrlLarge ?? loUrl;
  // Hi-res while focused; the hook keeps the old texture until the new
  // one decodes, so the swap is seamless both ways.
  const { texture, aspect } = useImageTexture(selected ? hiUrl : loUrl);

  const [width, height] = paintingSize(art, aspect, placement.maxWidth);

  const groupRef = useRef<Group>(null);
  const basePosition = useMemo(
    () => new Vector3(...placement.position),
    [placement],
  );
  const popPosition = useMemo(
    () =>
      new Vector3(...computeFocusPose(placement, width, height).paintingPosition),
    [placement, width, height],
  );

  // Pop off the wall toward the viewer when focused, glide back on close
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const target = selected ? popPosition : basePosition;
    const distSq = group.position.distanceToSquared(target);
    if (distSq === 0) return;
    if (distSq < 1e-6) {
      group.position.copy(target);
      return;
    }
    const k = 1 - Math.exp(-POP_DAMPING * Math.min(delta, MAX_DELTA));
    group.position.lerp(target, k);
  });

  const canvasRef = useRef<Mesh>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    return registerArtworkMesh(canvasRef.current, id);
  }, [id]);

  return (
    <group
      ref={groupRef}
      position={placement.position}
      rotation-y={placement.rotationY}
    >
      <Frame width={width} height={height} hovered={hovered} />
      <mesh
        ref={canvasRef}
        position-z={0.04}
        onClick={(e) => {
          e.stopPropagation();
          // Touch / unlocked-pointer path; crosshair clicks are handled
          // by InteractionManager while the pointer is locked.
          if (
            !document.pointerLockElement &&
            useStore.getState().viewMode === "walking"
          ) {
            selectArtwork(id);
          }
        }}
      >
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshStandardMaterial color="#33291f" />
        )}
      </mesh>
    </group>
  );
}
