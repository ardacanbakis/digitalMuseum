import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type Group, type Material, type Mesh } from "three";
import type { ArtworkEntry } from "../../data/types";
import { useStore } from "../../store";
import { Frame } from "./Frame";
import { registerArtworkMesh, selectArtwork } from "./interaction";
import { computeFocusPose, paintingSize, type Placement } from "./layout";
import { useImageTexture } from "./useImageTexture";

const POP_DAMPING = 6; // pop-out/return animation speed
const MAX_DELTA = 0.05;
const DIMMED_OPACITY = 0.12; // unfocused paintings fade while one is inspected

export function Painting({
  entry,
  placement,
  active,
}: {
  entry: ArtworkEntry;
  placement: Placement;
  active: boolean;
}) {
  const id = entry.wikidataId;
  const art = useStore((s) => s.artworkData[id]?.data);
  const selected = useStore((s) => s.selectedArtwork === id);
  const otherSelected = useStore(
    (s) => s.selectedArtwork !== null && s.selectedArtwork !== id,
  );
  const hovered = useStore((s) => s.hoveredArtwork === id);

  const loUrl = art?.imageUrlSmall ?? art?.thumbnailUrl;
  const hiUrl = art?.imageUrlLarge ?? loUrl;
  // Hi-res while focused; the hook keeps the old texture until the new
  // one decodes, so the swap is seamless both ways. Inactive (distant)
  // rooms pass undefined, which frees the texture.
  const url = active || selected ? (selected ? hiUrl : loUrl) : undefined;
  const { texture, aspect } = useImageTexture(url);

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

  const opacityRef = useRef(1);

  // Pop off the wall toward the viewer when focused, glide back on close;
  // fade the rest of the room while any painting is inspected so a large
  // popped canvas doesn't visually clash with its neighbors.
  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const k = 1 - Math.exp(-POP_DAMPING * Math.min(delta, MAX_DELTA));

    const target = selected ? popPosition : basePosition;
    const distSq = group.position.distanceToSquared(target);
    if (distSq > 0) {
      if (distSq < 1e-6) group.position.copy(target);
      else group.position.lerp(target, k);
    }

    const targetOpacity = otherSelected ? DIMMED_OPACITY : 1;
    if (opacityRef.current !== targetOpacity) {
      let v = opacityRef.current + (targetOpacity - opacityRef.current) * k;
      if (Math.abs(v - targetOpacity) < 0.01) v = targetOpacity;
      opacityRef.current = v;
      group.traverse((obj) => {
        const mesh = obj as Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as Material;
        material.transparent = v < 1;
        material.opacity = v;
      });
    }
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
      <Frame
        width={width}
        height={height}
        hovered={hovered}
        room={entry.room}
      />
      <mesh
        ref={canvasRef}
        position-z={0.04}
        onClick={(e) => {
          e.stopPropagation();
          // Touch / unlocked-pointer path; crosshair clicks are handled
          // by InteractionManager while the pointer is locked. Ignore
          // drag-pan releases (large pointer travel).
          if (document.pointerLockElement || e.delta > 5) return;
          const { viewMode, selectedArtwork, setSelectedArtwork } =
            useStore.getState();
          if (viewMode === "walking") selectArtwork(id);
          // While inspecting, clicking a dimmed neighbor switches to it
          else if (viewMode === "inspecting" && selectedArtwork !== id) {
            setSelectedArtwork(id);
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
