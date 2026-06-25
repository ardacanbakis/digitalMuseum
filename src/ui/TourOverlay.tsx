import { useCallback, useEffect, useRef, useState } from "react";
import { manifestById } from "../data/manifest";
import { roomById } from "../scene/rooms/roomDefs";
import { useStore } from "../store";
import styles from "./TourOverlay.module.css";

const HIDE_AFTER_MS = 3500;

/**
 * Guided tour: a full-screen slideshow of a chosen set of works that
 * advances itself while the ambient music plays. Duration, auto-hide and
 * caption size come from the tour settings in the store.
 */
export function TourOverlay() {
  const open = useStore((s) => s.viewMode === "tour");
  const ids = useStore((s) => s.tourIds);
  const durationMs = useStore((s) => s.tourDurationMs);
  const autoHide = useStore((s) => s.tourAutoHide);
  const fontScale = useStore((s) => s.tourFontScale);
  const setFontScale = useStore((s) => s.setTourFontScale);
  const captionSide = useStore((s) => s.tourCaptionSide);
  const cycleSide = useStore((s) => s.cycleTourCaptionSide);
  const artworkData = useStore((s) => s.artworkData);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const exit = useCallback(() => useStore.getState().setViewMode("menu"), []);
  const go = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (ids.length ? (i + dir + ids.length) % ids.length : 0)),
    [ids.length],
  );

  // Reset on (re)open
  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setPaused(false);
    setUiVisible(true);
  }, [open]);

  // Auto-advance
  useEffect(() => {
    if (!open || paused || ids.length === 0) return;
    const t = window.setTimeout(() => go(1), durationMs);
    return () => window.clearTimeout(t);
  }, [open, paused, index, durationMs, ids.length, go]);

  // Auto-hide the UI after inactivity (when enabled)
  const poke = useCallback(() => {
    setUiVisible(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (autoHide) {
      hideTimer.current = window.setTimeout(
        () => setUiVisible(false),
        HIDE_AFTER_MS,
      );
    }
  }, [autoHide]);

  useEffect(() => {
    if (!open) return;
    poke();
    if (!autoHide) setUiVisible(true);
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [open, autoHide, index, poke]);

  // Keyboard: ←/→ navigate, Space pauses, +/- font (ESC handled by Hud)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      poke();
      if (e.code === "ArrowRight") go(1);
      else if (e.code === "ArrowLeft") go(-1);
      else if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "+" || e.key === "=") setFontScale(fontScale + 0.1);
      else if (e.key === "-") setFontScale(fontScale - 0.1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, poke, fontScale, setFontScale]);

  if (!open) return null;

  const id = ids[index];
  const entry = id ? manifestById.get(id) : undefined;
  const art = id ? artworkData[id]?.data : undefined;
  const title = art?.title ?? entry?.wikipediaTitle ?? "";
  const room = entry ? (roomById.get(entry.room)?.name ?? "") : "";
  const image = art?.imageUrlLarge ?? art?.imageUrlSmall ?? art?.thumbnailUrl;

  return (
    <div
      className={styles.overlay}
      data-layout={captionSide}
      data-hidecursor={autoHide && !uiVisible}
      onMouseMove={poke}
      onClick={poke}
    >
      <div className={styles.stage}>
        {image ? (
          <img key={id} className={styles.image} src={image} alt={title} />
        ) : (
          <div className={styles.loading}>Loading…</div>
        )}
      </div>

      <div className={styles.uiLayer} data-visible={uiVisible}>
        <div
          className={styles.caption}
          key={`cap-${id}`}
          style={{ fontSize: `${fontScale}rem` }}
        >
          <span className={styles.room}>{room}</span>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.meta}>
            {art?.artist ?? entry?.artist}
            {(art?.artist ?? entry?.artist) && art?.year ? ", " : ""}
            {art?.year}
          </p>
          {art?.extract && <p className={styles.extract}>{art.extract}</p>}
        </div>

        <div className={styles.progress}>
          <div
            key={`bar-${index}-${paused}-${durationMs}`}
            className={styles.progressFill}
            style={{
              animationDuration: `${durationMs}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>

        {/* Grouped so side layouts can stack them: counter / transport /
            adjust / exit on their own rows; bottom layout flows inline. */}
        <div className={styles.controls}>
          <span className={styles.counter}>
            {index + 1} / {ids.length}
          </span>
          <div className={styles.group}>
            <button onClick={() => go(-1)} aria-label="Previous">
              ⏮
            </button>
            <button
              onClick={() => setPaused((p) => !p)}
              aria-label="Play / pause"
            >
              {paused ? "▶" : "⏸"}
            </button>
            <button onClick={() => go(1)} aria-label="Next">
              ⏭
            </button>
          </div>
          <div className={styles.group}>
            <button onClick={() => setFontScale(fontScale - 0.1)} aria-label="Smaller text">
              A−
            </button>
            <button onClick={() => setFontScale(fontScale + 0.1)} aria-label="Larger text">
              A+
            </button>
            <button
              onClick={cycleSide}
              aria-label="Caption position"
              title="Caption position (bottom / left / right)"
            >
              👁
            </button>
          </div>
          <button className={styles.exit} onClick={exit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
