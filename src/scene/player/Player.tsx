import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { useStore } from "../../store";
import {
  computeFocusPose,
  getRoomPlacements,
  paintingSize,
} from "../artworks/layout";
import type { RoomDef } from "../rooms/roomDefs";
import { EYE_HEIGHT, RUN_SPEED, WALK_SPEED, resolveMovement } from "./collision";
import { input } from "./input";
import { useKeyboardControls } from "./useKeyboardControls";

const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_LOOK_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const MAX_DELTA = 0.05; // clamp dt so tab-switches can't tunnel through walls
const FOCUS_DAMPING = 4; // camera glide speed toward a focused artwork

const UP = new Vector3(0, 1, 0);
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 1.12;
const ZOOM_SCRATCH = new Vector3();

interface FocusTarget {
  id: string;
  position: Vector3;
  lookTarget: Vector3;
  quaternion: Quaternion;
}

export function Player({ room }: { room: RoomDef }) {
  const camera = useThree((s) => s.camera);
  const yaw = useRef(Math.PI); // spawn facing -Z side of the room
  const pitch = useRef(0);

  useKeyboardControls();

  useEffect(() => {
    camera.rotation.order = "YXZ";
    camera.position.set(room.spawn[0], EYE_HEIGHT, room.spawn[1]);
  }, [camera, room]);

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
  const zoomRef = useRef(1);
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

  useFrame((_, delta) => {
    const store = useStore.getState();
    const dt = Math.min(delta, MAX_DELTA);

    // Inspect mode: glide to a framed viewing position in front of the work
    if (store.viewMode === "inspecting" && store.selectedArtwork) {
      if (focusRef.current?.id !== store.selectedArtwork) {
        const placement = getRoomPlacements(room).get(store.selectedArtwork);
        if (placement) {
          const art = store.artworkData[store.selectedArtwork]?.data;
          const [w, h] = paintingSize(art, null, placement.maxWidth);
          const pose = computeFocusPose(placement, w, h);
          const position = new Vector3(...pose.cameraPosition);
          const quaternion = new Quaternion().setFromRotationMatrix(
            new Matrix4().lookAt(
              position,
              new Vector3(...pose.lookTarget),
              UP,
            ),
          );
          focusRef.current = {
            id: store.selectedArtwork,
            position,
            lookTarget: new Vector3(...pose.lookTarget),
            quaternion,
          };
          zoomRef.current = 1;
        }
      }
      const focus = focusRef.current;
      if (focus) {
        // Zoom scales the camera's distance from the painting
        const target = ZOOM_SCRATCH.copy(focus.position)
          .sub(focus.lookTarget)
          .multiplyScalar(zoomRef.current)
          .add(focus.lookTarget);
        const k = 1 - Math.exp(-FOCUS_DAMPING * dt);
        camera.position.lerp(target, k);
        camera.quaternion.slerp(focus.quaternion, k);
      }
      wasInspecting.current = true;
      return;
    }

    focusRef.current = null;
    if (wasInspecting.current) {
      // Resume walking from wherever the glide left the camera
      wasInspecting.current = false;
      const e = new Euler().setFromQuaternion(camera.quaternion, "YXZ");
      yaw.current = e.y;
      pitch.current = e.x;
    }

    if (store.viewMode !== "walking") return;

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
      room.colliders,
    );
    camera.position.set(nx, EYE_HEIGHT, nz);
  });

  return null;
}
