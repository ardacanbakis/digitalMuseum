import { useEffect, useRef } from "react";
import {
  nextTrack,
  prevTrack,
  setMusicVolume,
  toggleMute,
  togglePlay,
} from "../audio/musicEngine";
import { playlist, trackPageUrl } from "../data/playlist";
import { useStore } from "../store";
import styles from "./MusicPlayer.module.css";

const AUTO_HIDE_MS = 4000;

/**
 * Auto-hiding ambient music pill, docked bottom-right. Collapses to a
 * note icon after ~4s idle (and always while an info panel is open so it
 * never overlaps it); reappears on hover/tap, N/P, or track change.
 */
export function MusicPlayer() {
  const viewMode = useStore((s) => s.viewMode);
  const started = useStore((s) => s.musicStarted);
  const trackIndex = useStore((s) => s.trackIndex);
  const isPlaying = useStore((s) => s.isPlaying);
  const volume = useStore((s) => s.musicVolume);
  const muted = useStore((s) => s.muted);
  const expanded = useStore((s) => s.playerExpanded);
  const setExpanded = useStore((s) => s.setPlayerExpanded);
  const hideTimer = useRef<number | null>(null);

  const armHide = () => {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(
      () => useStore.getState().setPlayerExpanded(false),
      AUTO_HIDE_MS,
    );
  };

  // Re-arm the hide timer whenever the pill (re)expands or track changes
  useEffect(() => {
    if (expanded) armHide();
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
  }, [expanded, trackIndex]);

  if (!started || viewMode === "menu" || playlist.length === 0) return null;

  const track = playlist[trackIndex] ?? playlist[0];
  // Never overlap the artwork info panel: icon mode only while inspecting
  const showPill = expanded && viewMode !== "inspecting";

  if (!showPill) {
    return (
      <button
        className={styles.icon}
        data-playing={isPlaying && !muted}
        onPointerEnter={() => setExpanded(true)}
        onClick={() => setExpanded(true)}
        aria-label="Music player"
      >
        <span className={styles.eq}>
          <i />
          <i />
          <i />
        </span>
        ♪
      </button>
    );
  }

  return (
    <div
      className={styles.pill}
      onPointerMove={armHide}
      onPointerDown={armHide}
    >
      <div className={styles.info}>
        <span className={styles.trackTitle}>
          {track.composer} — {track.title}
        </span>
        <span className={styles.trackMeta}>
          {track.performer && <span>{track.performer} · </span>}
          <a href={trackPageUrl(track)} target="_blank" rel="noreferrer">
            {track.license}
          </a>
        </span>
      </div>
      <div className={styles.controls}>
        <button onClick={prevTrack} aria-label="Previous track">
          ⏮
        </button>
        <button onClick={togglePlay} aria-label="Play / pause">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={nextTrack} aria-label="Next track">
          ⏭
        </button>
        <button
          onClick={toggleMute}
          aria-label="Mute"
          className={muted ? styles.mutedBtn : undefined}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setMusicVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
