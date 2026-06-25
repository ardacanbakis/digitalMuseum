import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Raycaster, Vector2 } from "three";
import { useStore } from "../../store";
import {
  closeInspect,
  interactiveMeshes,
  navigateArtwork,
  openFrame,
  selectArtwork,
  setTapRaycaster,
} from "./interaction";

const SCREEN_CENTER = new Vector2(0, 0);
const REACH = 7; // meters within which artworks react to the crosshair

/**
 * Crosshair-based artwork interaction while the pointer is locked:
 * raycast from screen center each frame for hover, click to inspect.
 * Also exposes a tap raycaster for the touch look-zone.
 */
export function InteractionManager() {
  const camera = useThree((s) => s.camera);
  const raycaster = useMemo(() => {
    const r = new Raycaster();
    r.far = REACH;
    return r;
  }, []);

  useFrame(() => {
    const store = useStore.getState();
    if (store.viewMode !== "walking" || !document.pointerLockElement) {
      if (store.hoveredArtwork) store.setHoveredArtwork(null);
      if (store.hoveredFrame) store.setHoveredFrame(null);
      return;
    }
    raycaster.setFromCamera(SCREEN_CENTER, camera);
    const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
    const artId = (hit?.object.userData.artworkId as string | undefined) ?? null;
    const frameId = (hit?.object.userData.frameId as string | undefined) ?? null;
    if (artId !== store.hoveredArtwork) store.setHoveredArtwork(artId);
    if (frameId !== store.hoveredFrame) store.setHoveredFrame(frameId);
  });

  useEffect(() => {
    const onClick = () => {
      const store = useStore.getState();
      if (!document.pointerLockElement || store.viewMode !== "walking") return;
      if (store.hoveredArtwork) selectArtwork(store.hoveredArtwork);
      else if (store.hoveredFrame) openFrame(store.hoveredFrame);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // While inspecting: ←/→ (or Q/E, A/D) browse the room; Space puts the
  // painting back; a double-click anywhere also closes the focus.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || useStore.getState().viewMode !== "inspecting") return;
      if (["ArrowRight", "KeyE", "KeyD"].includes(e.code)) navigateArtwork(1);
      else if (["ArrowLeft", "KeyQ", "KeyA"].includes(e.code)) {
        navigateArtwork(-1);
      } else if (e.code === "Space") {
        e.preventDefault();
        closeInspect();
      }
    };
    const onDblClick = () => {
      if (useStore.getState().viewMode === "inspecting") closeInspect();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("dblclick", onDblClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("dblclick", onDblClick);
    };
  }, []);

  useEffect(() => {
    setTapRaycaster((ndcX, ndcY) => {
      if (useStore.getState().viewMode !== "walking") return;
      raycaster.setFromCamera(new Vector2(ndcX, ndcY), camera);
      const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
      const id = hit?.object.userData.artworkId as string | undefined;
      const frameId = hit?.object.userData.frameId as string | undefined;
      if (id) selectArtwork(id);
      else if (frameId) openFrame(frameId);
    });
    return () => setTapRaycaster(null);
  }, [camera, raycaster]);

  return null;
}
