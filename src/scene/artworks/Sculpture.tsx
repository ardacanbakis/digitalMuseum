import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { Vector3, type Group, type Material, type Mesh } from "three";
import type { ArtworkEntry } from "../../data/types";
import { useStore } from "../../store";
import { registerArtworkMesh, selectArtwork } from "./interaction";
import { computeFocusPose, paintingSize, type Placement } from "./layout";
import { useImageTexture } from "./useImageTexture";

const POP_DAMPING = 6;
const MAX_DELTA = 0.05;
const DIMMED_OPACITY = 0.12;
const MAX_SCULPTURE_HEIGHT = 1.9; // photo height above the pedestal

/**
 * A sculpture shown as a photograph on a pedestal: billboarded plane that
 * always faces the visitor (the pedestal box itself is part of the room).
 * True 3D museum scans (Smithsonian glTF etc.) can replace this later.
 */
export function Sculpture({
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
  const url = active || selected ? (selected ? hiUrl : loUrl) : undefined;
  const { texture, aspect } = useImageTexture(url);

  let [width, height] = paintingSize(art, aspect, placement.maxWidth);
  if (height > MAX_SCULPTURE_HEIGHT) {
    width *= MAX_SCULPTURE_HEIGHT / height;
    height = MAX_SCULPTURE_HEIGHT;
  }

  const groupRef = useRef<Group>(null);
  // Group origin = photo center, resting on the pedestal top
  const basePosition = useMemo(
    () =>
      new Vector3(
        placement.position[0],
        placement.position[1] + height / 2 + 0.02,
        placement.position[2],
      ),
    [placement, height],
  );
  const popPosition = useMemo(
    () =>
      new Vector3(
        ...computeFocusPose(placement, width, height).paintingPosition,
      ),
    [placement, width, height],
  );
  const opacityRef = useRef(1);

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

  const meshRef = useRef<Mesh>(null);
  useEffect(() => {
    if (!meshRef.current) return;
    return registerArtworkMesh(meshRef.current, id);
  }, [id]);

  return (
    <group ref={groupRef} position={basePosition.toArray()}>
      <Billboard lockX lockZ>
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            if (document.pointerLockElement || e.delta > 5) return;
            const { viewMode, selectedArtwork, setSelectedArtwork } =
              useStore.getState();
            if (viewMode === "walking") selectArtwork(id);
            else if (viewMode === "inspecting" && selectedArtwork !== id) {
              setSelectedArtwork(id);
            }
          }}
        >
          <planeGeometry args={[width, height]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshStandardMaterial
              color={hovered ? "#5a5347" : "#494337"}
            />
          )}
        </mesh>
      </Billboard>
    </group>
  );
}
