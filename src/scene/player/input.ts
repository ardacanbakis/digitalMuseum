/**
 * Shared mutable input state, written by keyboard/touch handlers and read
 * by the Player each frame. A plain singleton avoids re-renders at 60Hz.
 */
export const input = {
  keys: {
    forward: false,
    back: false,
    left: false,
    right: false,
  },
  /** Normalized joystick vector, x: strafe right, y: forward. */
  joystick: { x: 0, y: 0 },
  /** Accumulated touch-drag look delta in px; Player consumes and zeroes it. */
  lookDelta: { x: 0, y: 0 },
};

export function resetInput() {
  input.keys.forward = false;
  input.keys.back = false;
  input.keys.left = false;
  input.keys.right = false;
  input.joystick.x = 0;
  input.joystick.y = 0;
  input.lookDelta.x = 0;
  input.lookDelta.y = 0;
}

export const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;
