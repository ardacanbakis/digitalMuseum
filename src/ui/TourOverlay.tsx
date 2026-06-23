import { useCallback, useEffect, useState } from "react";
import { manifestById } from "../data/manifest";
import { loadTourData, TOUR_IDS } from "../data/tour";
import { roomById } from "../scene/rooms/roomDefs";
import { useStore } from "../store";
import styles from "./TourOverlay.module.css";

const SLIDE_MS = 9000;

/**
 * Guided tour: a full-screen slideshow of highlight artworks that advances
 * itself while the ambient music plays. Launched from the welcome menu.
 */
export function TourOverlay() {
  const open = useStore((s) => s.viewMode === "tour");
  const artworkData = useStore((s) => s.artworkData);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const exit = useCallback(() => useStore.getState().setViewMode("menu"), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (i + dir + TOUR_IDS.length) % TOUR_IDS.length),
    [],
  );

  // Start: load every highlight's room, reset to the first slide
  useEffect(() => {
    if (!open) return;
    loadTourData();
    setIndex(0);
    setPaused(false);
  }, [open]);

  // Auto-advance
  useEffect(() => {
    if (!open || paused) return;
    const t = window.setTimeout(() => go(1), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [open, paused, index, go]);

  // Keyboard: ←/→ navigate, Space pauses (ESC handled by the Hud)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "ArrowRight") go(1);
      else if (e.code === "ArrowLeft") go(-1);
      else if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  if (!open) return null;

  const id = TOUR_IDS[index];
  const entry = manifestById.get(id);
  const art = artworkData[id]?.data;
  const title = art?.title ?? entry?.wikipediaTitle ?? "";
  const room = entry ? (roomById.get(entry.room)?.name ?? "") : "";
  const image = art?.imageUrlLarge ?? art?.imageUrlSmall ?? art?.thumbnailUrl;

  return (
    <div className={styles.overlay}>
      <div className={styles.stage}>
        {image ? (
          <img key={id} className={styles.image} src={image} alt={title} />
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>

      <div className={styles.caption} key={`cap-${id}`}>
        <span className={styles.room}>{room}</span>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.meta}>
          {art?.artist}
          {art?.artist && art?.year ? ", " : ""}
          {art?.year}
        </p>
        {art?.extract && <p className={styles.extract}>{art.extract}</p>}
      </div>

      <div className={styles.progress}>
        <div
          key={`bar-${index}-${paused}`}
          className={styles.progressFill}
          style={{
            animationDuration: `${SLIDE_MS}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>

      <div className={styles.controls}>
        <span className={styles.counter}>
          {index + 1} / {TOUR_IDS.length}
        </span>
        <button onClick={() => go(-1)} aria-label="Previous">
          ⏮
        </button>
        <button onClick={() => setPaused((p) => !p)} aria-label="Play / pause">
          {paused ? "▶" : "⏸"}
        </button>
        <button onClick={() => go(1)} aria-label="Next">
          ⏭
        </button>
        <button className={styles.exit} onClick={exit}>
          Exit tour
        </button>
      </div>
    </div>
  );
}
