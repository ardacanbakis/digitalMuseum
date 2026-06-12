import { useEffect } from "react";
import { input, resetInput } from "./input";

const KEY_MAP: Record<string, keyof typeof input.keys> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  KeyQ: "left",
  ArrowLeft: "left",
  KeyD: "right",
  KeyE: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
  ShiftRight: "run",
};

export function useKeyboardControls() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action) {
        input.keys[action] = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action) input.keys[action] = false;
    };
    // Drop stuck keys when the tab loses focus mid-keypress
    const onBlur = () => resetInput();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
}
