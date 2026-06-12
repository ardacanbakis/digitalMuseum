import { useCallback, useEffect } from "react";
import { useStore } from "../../store";
import { isTouchDevice, resetInput } from "./input";

let lockElement: HTMLElement | null = null;

/** Called once from the Canvas onCreated with the WebGL canvas element. */
export function setLockElement(el: HTMLElement) {
  lockElement = el;
}

/**
 * Syncs the browser pointer-lock state with viewMode and exposes
 * enter()/exit(). On touch devices there is no pointer lock — entering
 * simply switches to walking mode.
 */
export function usePointerLock() {
  const setViewMode = useStore((s) => s.setViewMode);

  useEffect(() => {
    if (isTouchDevice()) return;

    const onChange = () => {
      if (document.pointerLockElement) {
        setViewMode("walking");
      } else {
        // Browser released the lock (ESC or focus loss). When we unlocked
        // intentionally to inspect an artwork, stay in inspect mode.
        resetInput();
        if (useStore.getState().viewMode === "walking") setViewMode("menu");
      }
    };
    const onError = () => {
      resetInput();
      setViewMode("menu");
    };

    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("pointerlockerror", onError);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("pointerlockerror", onError);
    };
  }, [setViewMode]);

  const enter = useCallback(() => {
    if (isTouchDevice()) {
      setViewMode("walking");
      return;
    }
    // requestPointerLock returns a promise in modern browsers; it rejects
    // during Chrome's ~1s cooldown after ESC — stay on the menu in that case.
    const result = lockElement?.requestPointerLock() as unknown;
    if (result instanceof Promise) {
      result.catch(() => setViewMode("menu"));
    }
  }, [setViewMode]);

  const exit = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    } else {
      resetInput();
      setViewMode("menu");
    }
  }, [setViewMode]);

  return { enter, exit };
}
