import { useStore } from "../store";
import { usePointerLock } from "../scene/player/usePointerLock";
import { isTouchDevice } from "../scene/player/input";
import styles from "./Hud.module.css";

export function Hud() {
  const viewMode = useStore((s) => s.viewMode);
  const { enter, exit } = usePointerLock();
  const touch = isTouchDevice();

  if (viewMode === "menu") {
    return (
      <div className={styles.menu}>
        <h1 className={styles.title}>Digital Museum</h1>
        <p className={styles.subtitle}>A walkable gallery of canonical art</p>
        <button className={styles.enterButton} onClick={enter}>
          Enter Museum
        </button>
        <p className={styles.hint}>
          {touch
            ? "Left side: joystick to walk · Right side: drag to look"
            : "WASD / arrows to walk · Mouse to look · ESC to release the cursor"}
        </p>
      </div>
    );
  }

  return (
    <>
      {!touch && <div className={styles.crosshair} />}
      {touch && (
        <button
          className={styles.exitButton}
          onClick={exit}
          aria-label="Back to menu"
        >
          ✕
        </button>
      )}
    </>
  );
}
