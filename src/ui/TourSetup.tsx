import { highlightsGroup } from "../data/collection";
import { launchTour } from "./tourActions";
import { TourSettings } from "./TourSettings";
import styles from "./TourMenu.module.css";

/** Pre-tour chooser: configure settings and start the highlights tour. */
export function TourSetup({
  onClose,
  onBrowse,
}: {
  onClose: () => void;
  onBrowse: () => void;
}) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className={styles.heading}>Guided tour</h2>
        <p className={styles.sub}>
          A hands-free slideshow of {highlightsGroup.ids.length} highlights,
          with music. Or browse a single era or artist.
        </p>

        <TourSettings />

        <button
          className={styles.startButton}
          onClick={() => {
            launchTour(highlightsGroup);
            onClose();
          }}
        >
          ▶ Start guided tour
        </button>
        <button className={styles.linkButton} onClick={onBrowse}>
          Browse by era or artist →
        </button>
      </div>
    </div>
  );
}
