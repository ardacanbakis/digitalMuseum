import type { Object3D } from "three";
import { useStore } from "../../store";

/** Meshes the crosshair/tap raycaster tests against. */
export const interactiveMeshes: Object3D[] = [];

export function registerArtworkMesh(
  mesh: Object3D,
  artworkId: string,
): () => void {
  mesh.userData.artworkId = artworkId;
  interactiveMeshes.push(mesh);
  return () => {
    const i = interactiveMeshes.indexOf(mesh);
    if (i !== -1) interactiveMeshes.splice(i, 1);
  };
}

/** Enter inspect mode for an artwork; unlocks the pointer on desktop. */
export function selectArtwork(artworkId: string): void {
  const store = useStore.getState();
  store.setHoveredArtwork(null);
  store.setSelectedArtwork(artworkId);
  store.setViewMode("inspecting");
  if (document.pointerLockElement) document.exitPointerLock();
}

// Bridge so DOM-side touch handlers (outside the Canvas) can raycast a tap.
let tapRaycaster: ((ndcX: number, ndcY: number) => void) | null = null;

export function setTapRaycaster(
  fn: ((ndcX: number, ndcY: number) => void) | null,
): void {
  tapRaycaster = fn;
}

export function raycastTap(clientX: number, clientY: number): void {
  tapRaycaster?.(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1,
  );
}
