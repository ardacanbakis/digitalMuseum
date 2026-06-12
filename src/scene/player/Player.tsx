import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Euler,
  MathUtils,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Vector3,
} from "three";
import { useStore } from "../../store";
import {
  computeFocusPose,
  getPlacement,
  paintingSize,
} from "../artworks/layout";
import { allColliders, lobby } from "../rooms/roomDefs";
import { EYE_HEIGHT, RUN_SPEED, WALK_SPEED, resolveMovement } from "./collision";
import { input } from "./input";
import { useKeyboardControls } from "./useKeyboardControls";

const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_LOOK_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const MAX_DELTA = 0.05; // clamp dt so tab-switches can't tunnel through walls
const FOCUS_DAMPING = 4; // camera glide speed toward a focused artwork

const UP = new Vector3(0, 1, 0);
const ZOOM_MIN = 0.35;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 1.12;
const PAN_LIMIT = 0.45; // pan stays within this fraction of the canvas size
const ZOOM_SCRATCH = new Vector3();

interface FocusTarget {
  id: string;
  /** Default camera stand-back position (zoom = 1). */
  basePosition: Vector3;
  /** Center of the popped-out painting — zoom moves toward it. */
  paintingPosition: Vector3;
  /** Camera-right along the wall, for panning across the canvas. */
  right: Vector3;
  width: number;
  height: number;
  quaternion: Quaternion;
}

export function Player() {
  const camera = useThree((s) => s.camera);
  const yaw = useRef(lobby.spawnYaw);
  const pitch = useRef(0);

  useKeyboardControls();

  useEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(lobby.spawn[0], EYE_HEIGHT, lobby.spawn[1]);
  }, [camera]);

  // Desktop mouse-look while pointer is locked
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      pitch.current = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, pitch.current),
      );
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  const focusRef = useRef<FocusTarget | null>(null);
  const wasInspecting = useRef(false);
  const syncTimer = useRef(0);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(
    null,
  );
  const gl = useThree((s) => s.gl);

  // Mouse-wheel zoom while inspecting (canvas only, so the info panel
  // still scrolls normally)
  useEffect(() => {
    const el = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      if (useStore.getState().viewMode !== "inspecting") return;
      const factor = e.deltaY > 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      zoomRef.current = Math.min(
        ZOOM_MAX,
        Math.max(ZOOM_MIN, zoomRef.current * factor),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [gl]);

  // Click-and-drag to pan across the painting while inspecting, clamped
  // to the canvas edges. Drag speed tracks the current zoom level.
  useEffect(() => {
    const el = gl.domElement;
    const onPointerDown = (e: PointerEvent) => {
      if (useStore.getState().viewMode !== "inspecting") return;
      if (dragRef.current) return;
      dragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const focus = focusRef.current;
      if (!drag || e.pointerId !== drag.pointerId || !focus) return;
      if (useStore.getState().viewMode !== "inspecting") {
        dragRef.current = null;
        return;
      }
      const fov = (camera as PerspectiveCamera).fov ?? 70;
      const distance = camera.position.distanceTo(focus.paintingPosition);
      const metersPerPixel =
        (2 * distance * Math.tan(MathUtils.degToRad(fov) / 2)) /
        el.clientHeight;
      // "Grab the canvas" feel: dragging right shows what's to the left
      const pan = panRef.current;
      pan.x = MathUtils.clamp(
        pan.x - (e.clientX - drag.x) * metersPerPixel,
        -focus.width * PAN_LIMIT,
        focus.width * PAN_LIMIT,
      );
      pan.y = MathUtils.clamp(
        pan.y + (e.clientY - drag.y) * metersPerPixel,
        -focus.height * PAN_LIMIT,
        focus.height * PAN_LIMIT,
      );
      drag.x = e.clientX;
      drag.y = e.clientY;
    };
    const onPointerEnd = (e: PointerEvent) => {
      if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
    };
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [gl, camera]);

  useFrame((_, delta) => {
    const store = useStore.getState();
    const dt = Math.min(delta, MAX_DELTA);

    // Inspect mode: glide to a framed viewing position in front of the work
    if (store.viewMode === "inspecting" && store.selectedArtwork) {
      if (focusRef.current?.id !== store.selectedArtwork) {
        const placement = getPlacement(store.selectedArtwork);
        if (placement) {
          const art = store.artworkData[store.selectedArtwork]?.data;
          const [w, h] = paintingSize(art, null, placement.maxWidth);
          const pose = computeFocusPose(placement, w, h);
          const basePosition = new Vector3(...pose.cameraPosition);
          const quaternion = new Quaternion().setFromRotationMatrix(
            new Matrix4().lookAt(
              basePosition,
              new Vector3(...pose.lookTarget),
              UP,
            ),
          );
          focusRef.current = {
            id: store.selectedArtwork,
            basePosition,
            paintingPosition: new Vector3(...pose.paintingPosition),
            right: new Vector3(placement.normal[1], 0, -placement.normal[0]),
            width: w,
            height: h,
            quaternion,
          };
          zoomRef.current = 1;
          panRef.current = { x: 0, y: 0 };
        }
      }
      const focus = focusRef.current;
      if (focus) {
        // Zoom moves the camera straight toward the painting's center
        // (it self-centers as you zoom in); pan slides parallel to the
        // canvas so you can study different parts of it.
        const target = ZOOM_SCRATCH.copy(focus.basePosition)
          .sub(focus.paintingPosition)
          .multiplyScalar(zoomRef.current)
          .add(focus.paintingPosition)
          .addScaledVector(focus.right, panRef.current.x);
        target.y += panRef.current.y;
        const k = 1 - Math.exp(-FOCUS_DAMPING * dt);
        camera.position.lerp(target, k);
        camera.quaternion.slerp(focus.quaternion, k);
      }
      wasInspecting.current = true;
      return;
    }

    focusRef.current = null;
    dragRef.current = null;
    if (wasInspecting.current) {
      // Resume walking from wherever the glide left the camera
      wasInspecting.current = false;
      const e = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yaw.current = e.y;
      pitch.current = e.x;
    }

    if (store.viewMode !== "walking") return;

    // Teleport requests from the map overlay
    if (store.teleportTarget) {
      const t = store.teleportTarget;
      camera.position.set(t.x, EYE_HEIGHT, t.z);
      yaw.current = t.yaw;
      pitch.current = 0;
      store.clearTeleport();
    }

    // Touch drag-look (accumulated by TouchControls)
    if (input.lookDelta.x !== 0 || input.lookDelta.y !== 0) {
      yaw.current -= input.lookDelta.x * TOUCH_LOOK_SENSITIVITY;
      pitch.current -= input.lookDelta.y * TOUCH_LOOK_SENSITIVITY;
      pitch.current = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, pitch.current),
      );
      input.lookDelta.x = 0;
      input.lookDelta.y = 0;
    }

    camera.rotation.set(pitch.current, yaw.current, 0);

    // Throttled position sync for the minimap marker
    syncTimer.current += dt;
    if (syncTimer.current > 0.25) {
      syncTimer.current = 0;
      const [px, pz] = store.playerPos;
      if (
        Math.abs(px - camera.position.x) > 0.1 ||
        Math.abs(pz - camera.position.z) > 0.1
      ) {
        store.setPlayerPos(camera.position.x, camera.position.z);
      }
    }

    // Movement intent: keyboard (digital) + joystick (analog)
    let forward =
      (input.keys.forward ? 1 : 0) - (input.keys.back ? 1 : 0) +
      input.joystick.y;
    let strafe =
      (input.keys.right ? 1 : 0) - (input.keys.left ? 1 : 0) +
      input.joystick.x;

    const len = Math.hypot(forward, strafe);
    if (len < 1e-3) return;
    if (len > 1) {
      forward /= len;
      strafe /= len;
    }

    // Camera-relative, ground-plane directions (yaw only, ignore pitch)
    const speed = input.keys.run ? RUN_SPEED : WALK_SPEED;
    const sin = Math.sin(yaw.current);
    const cos = Math.cos(yaw.current);
    const dx = (-sin * forward + cos * strafe) * speed * dt;
    const dz = (-cos * forward - sin * strafe) * speed * dt;

    const [nx, nz] = resolveMovement(
      camera.position.x,
      camera.position.z,
      dx,
      dz,
      allColliders,
    );
    camera.position.set(nx, EYE_HEIGHT, nz);
  });

  return null;
}
