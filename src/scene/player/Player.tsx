import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "../../store";
import type { RoomDef } from "../rooms/roomDefs";
import { EYE_HEIGHT, WALK_SPEED, resolveMovement } from "./collision";
import { input } from "./input";
import { useKeyboardControls } from "./useKeyboardControls";

const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_LOOK_SENSITIVITY = 0.005;
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const MAX_DELTA = 0.05; // clamp dt so tab-switches can't tunnel through walls

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

  useFrame((_, delta) => {
    if (useStore.getState().viewMode !== "walking") return;
    const dt = Math.min(delta, MAX_DELTA);

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
    const sin = Math.sin(yaw.current);
    const cos = Math.cos(yaw.current);
    const dx = (-sin * forward + cos * strafe) * WALK_SPEED * dt;
    const dz = (-cos * forward - sin * strafe) * WALK_SPEED * dt;

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
