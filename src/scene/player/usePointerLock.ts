import { useCallback, useEffect } from "react";
import { useStore } from "../../store";
import { isTouchDevice, resetInput } from "./input";

let lockElement: HTMLElement | null = null;

/** Called once from the Canvas onCreated with the WebGL canvas element. */
export function setLockElement(el: HTMLElement) {
  lockElement = el;
}

/**
 * Request pointer lock. The promise rejects during Chrome's ~1.3s
 * cooldown after an ESC unlock, or without a qualifying user gesture —
 * callers decide what failure means (menu fallback vs. stay put).
 */
export function requestLock(onFail?: () => void): void {
  if (!lockElement) {
    onFail?.();
    return;
  }
  const result = lockElement.requestPointerLock() as unknown;
  if (result instanceof Promise) {
    result.catch(() => onFail?.());
  }
}

/**
 * Syncs the browser pointer-lock state with viewMode and exposes
 * enter()/exit(). On touch devices there is no pointer lock — entering
 * simply switches to walking mode.
 *
 * Mounted once (by the Hud); also installs a click-to-relock handler so
 * that if a silent relock after closing an artwork fails, the next click
 * on the scene resumes mouse-look without bouncing through the menu.
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
      if (useStore.getState().viewMode === "menu") return;
      if (useStore.getState().viewMode === "walking") setViewMode("menu");
    };
    const onClick = (e: MouseEvent) => {
      if (
        useStore.getState().viewMode === "walking" &&
        !document.pointerLockElement &&
        e.target instanceof HTMLCanvasElement
      ) {
        requestLock();
      }
    };

    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("pointerlockerror", onError);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("pointerlockerror", onError);
      document.removeEventListener("click", onClick);
    };
  }, [setViewMode]);

  const enter = useCallback(() => {
    if (isTouchDevice()) {
      setViewMode("walking");
      return;
    }
    requestLock(() => setViewMode("menu"));
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
