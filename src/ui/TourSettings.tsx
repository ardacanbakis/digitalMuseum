import { useStore } from "../store";
import styles from "./TourMenu.module.css";

/** Shared tour settings: per-slide duration, auto-hide, caption size. */
export function TourSettings() {
  const durationMs = useStore((s) => s.tourDurationMs);
  const autoHide = useStore((s) => s.tourAutoHide);
  const fontScale = useStore((s) => s.tourFontScale);
  const setDuration = useStore((s) => s.setTourDurationMs);
  const setAutoHide = useStore((s) => s.setTourAutoHide);
  const setFontScale = useStore((s) => s.setTourFontScale);

  return (
    <div className={styles.settings}>
      <label className={styles.setting}>
        <span className={styles.settingLabel}>
          Time per slide: {Math.round(durationMs / 1000)}s
        </span>
        <input
          type="range"
          min={9}
          max={60}
          step={1}
          value={Math.round(durationMs / 1000)}
          onChange={(e) => setDuration(Number(e.target.value) * 1000)}
        />
      </label>

      <label className={styles.checkRow}>
        <input
          type="checkbox"
          checked={autoHide}
          onChange={(e) => setAutoHide(e.target.checked)}
        />
        <span>Auto-hide captions &amp; controls</span>
      </label>

      <div className={styles.fontRow}>
        <span className={styles.settingLabel}>
          Caption size: {Math.round(fontScale * 100)}%
        </span>
        <div className={styles.fontButtons}>
          <button onClick={() => setFontScale(fontScale - 0.1)} aria-label="Smaller">
            A−
          </button>
          <button onClick={() => setFontScale(fontScale + 0.1)} aria-label="Larger">
            A+
          </button>
        </div>
      </div>
    </div>
  );
}
