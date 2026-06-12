import { useEffect, useRef } from "react";
import type { Mesh } from "three";
import {
  commonsImageUrl,
  FOCUS_IMAGE_WIDTH,
  GALLERY_IMAGE_WIDTH,
} from "../../api/commons";
import type { ArtworkEntry } from "../../data/types";
import { useStore } from "../../store";
import { Frame } from "./Frame";
import { registerArtworkMesh, selectArtwork } from "./interaction";
import { paintingSize, type Placement } from "./layout";
import { useImageTexture } from "./useImageTexture";

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

  const loUrl = art?.imageFilename
    ? commonsImageUrl(art.imageFilename, GALLERY_IMAGE_WIDTH)
    : art?.thumbnailUrl;
  const hiUrl = art?.imageFilename
    ? commonsImageUrl(art.imageFilename, FOCUS_IMAGE_WIDTH)
    : loUrl;
  // Hi-res while focused; the hook keeps the old texture until the new
  // one decodes, so the swap is seamless both ways.
  const { texture, aspect } = useImageTexture(selected ? hiUrl : loUrl);

  const [width, height] = paintingSize(art, aspect, placement.maxWidth);

  const canvasRef = useRef<Mesh>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    return registerArtworkMesh(canvasRef.current, id);
  }, [id]);

  return (
    <group position={placement.position} rotation-y={placement.rotationY}>
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
