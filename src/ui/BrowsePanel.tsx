import { useMemo, useState } from "react";
import { artistGroups, eraGroups, type Group } from "../data/collection";
import { launchTour } from "./tourActions";
import { TourSettings } from "./TourSettings";
import styles from "./TourMenu.module.css";

/** Browse the collection by era or artist; pick a group to start its tour. */
export function BrowsePanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"era" | "artist">("era");
  const eras = useMemo(() => eraGroups(), []);
  const artists = useMemo(() => artistGroups(), []);
  const groups: Group[] = tab === "era" ? eras : artists;

  const start = (g: Group) => {
    launchTour(g);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 className={styles.heading}>Browse the collection</h2>
        <p className={styles.sub}>
          Pick a group to view its works as a slideshow.
        </p>

        <div className={styles.tabs}>
          <button
            className={styles.tab}
            data-active={tab === "era"}
            onClick={() => setTab("era")}
          >
            By era ({eras.length})
          </button>
          <button
            className={styles.tab}
            data-active={tab === "artist"}
            onClick={() => setTab("artist")}
          >
            By artist ({artists.length})
          </button>
        </div>

        <ul className={styles.groupList}>
          {groups.map((g) => (
            <li key={g.key}>
              <button className={styles.groupRow} onClick={() => start(g)}>
                <span className={styles.groupLabel}>{g.label}</span>
                <span className={styles.groupCount}>{g.ids.length}</span>
              </button>
            </li>
          ))}
        </ul>

        <TourSettings />
      </div>
    </div>
  );
}
