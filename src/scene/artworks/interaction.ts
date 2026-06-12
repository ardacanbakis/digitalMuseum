import type { Object3D } from "three";
import { useStore } from "../../store";
import { isTouchDevice } from "../player/input";
import { requestLock } from "../player/usePointerLock";
import { impressionismRoom } from "../rooms/roomDefs";
import { getRoomArtworkOrder } from "./layout";

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

/**
 * Leave inspect mode and resume walking. The relock is silent on
 * purpose: if the browser refuses (no user gesture / ESC cooldown),
 * the next click on the scene relocks — never bounce to the menu.
 */
export function closeInspect(): void {
  const store = useStore.getState();
  if (store.viewMode !== "inspecting") return;
  store.setSelectedArtwork(null);
  store.setViewMode("walking");
  if (!isTouchDevice()) requestLock();
}

/** Glide to the previous/next painting along the walls while inspecting. */
export function navigateArtwork(direction: 1 | -1): void {
  const store = useStore.getState();
  if (store.viewMode !== "inspecting" || !store.selectedArtwork) return;
  const order = getRoomArtworkOrder(impressionismRoom);
  const index = order.indexOf(store.selectedArtwork);
  if (index === -1) return;
  store.setSelectedArtwork(
    order[(index + direction + order.length) % order.length],
  );
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
