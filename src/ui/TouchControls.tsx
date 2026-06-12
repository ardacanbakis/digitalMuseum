import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { raycastTap } from "../scene/artworks/interaction";
import { input, isTouchDevice } from "../scene/player/input";
import styles from "./TouchControls.module.css";

const JOYSTICK_RADIUS = 50; // px travel of the stick knob
const TAP_MAX_DISTANCE = 10; // px of drift before a touch stops being a tap
const TAP_MAX_DURATION = 350; // ms

/**
 * Touch fallback: left-zone joystick drives input.joystick, right-zone drag
 * accumulates into input.lookDelta (consumed by the Player each frame).
 */
export function TouchControls() {
  const walking = useStore((s) => s.viewMode === "walking");
  const [touch, setTouch] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const joystickPointer = useRef<number | null>(null);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const lookPointer = useRef<number | null>(null);
  const lookLast = useRef({ x: 0, y: 0 });
  const lookStart = useRef({ x: 0, y: 0, time: 0, moved: 0 });

  useEffect(() => setTouch(isTouchDevice()), []);

  useEffect(() => {
    if (!walking || !touch) return;

    const setKnob = (dx: number, dy: number) => {
      if (knobRef.current) {
        knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId === joystickPointer.current) {
        let dx = e.clientX - joystickOrigin.current.x;
        let dy = e.clientY - joystickOrigin.current.y;
        const len = Math.hypot(dx, dy);
        if (len > JOYSTICK_RADIUS) {
          dx = (dx / len) * JOYSTICK_RADIUS;
          dy = (dy / len) * JOYSTICK_RADIUS;
        }
        input.joystick.x = dx / JOYSTICK_RADIUS;
        input.joystick.y = -dy / JOYSTICK_RADIUS; // screen-up = forward
        setKnob(dx, dy);
      } else if (e.pointerId === lookPointer.current) {
        input.lookDelta.x += e.clientX - lookLast.current.x;
        input.lookDelta.y += e.clientY - lookLast.current.y;
        lookLast.current = { x: e.clientX, y: e.clientY };
        lookStart.current.moved = Math.max(
          lookStart.current.moved,
          Math.hypot(
            e.clientX - lookStart.current.x,
            e.clientY - lookStart.current.y,
          ),
        );
      }
    };

    const onEnd = (e: PointerEvent) => {
      if (e.pointerId === joystickPointer.current) {
        joystickPointer.current = null;
        input.joystick.x = 0;
        input.joystick.y = 0;
        setKnob(0, 0);
      } else if (e.pointerId === lookPointer.current) {
        lookPointer.current = null;
        // A short, still touch is a tap → try to select an artwork
        if (
          e.type === "pointerup" &&
          lookStart.current.moved < TAP_MAX_DISTANCE &&
          performance.now() - lookStart.current.time < TAP_MAX_DURATION
        ) {
          raycastTap(e.clientX, e.clientY);
        }
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      joystickPointer.current = null;
      lookPointer.current = null;
      input.joystick.x = 0;
      input.joystick.y = 0;
    };
  }, [walking, touch]);

  if (!walking || !touch) return null;

  return (
    <>
      <div
        className={styles.joystickZone}
        onPointerDown={(e) => {
          if (joystickPointer.current !== null) return;
          joystickPointer.current = e.pointerId;
          joystickOrigin.current = { x: e.clientX, y: e.clientY };
        }}
      >
        <div className={styles.joystickBase}>
          <div ref={knobRef} className={styles.joystickKnob} />
        </div>
      </div>
      <div
        className={styles.lookZone}
        onPointerDown={(e) => {
          if (lookPointer.current !== null) return;
          lookPointer.current = e.pointerId;
          lookLast.current = { x: e.clientX, y: e.clientY };
          lookStart.current = {
            x: e.clientX,
            y: e.clientY,
            time: performance.now(),
            moved: 0,
          };
        }}
      />
    </>
  );
}
