import { useState } from "react";
import {
  nextTrack,
  playTrack,
  prevTrack,
  setMusicVolume,
  toggleMute,
  togglePlay,
} from "../audio/musicEngine";
import { playlist, trackPageUrl } from "../data/playlist";
import { useStore } from "../store";
import styles from "./MusicPanel.module.css";

/**
 * Music controls embedded in the pause/ESC menu (the player is hidden
 * while roaming). Shows what's playing, transport controls, volume, and a
 * collapsible browser of the full playlist.
 */
export function MusicPanel() {
  const started = useStore((s) => s.musicStarted);
  const trackIndex = useStore((s) => s.trackIndex);
  const isPlaying = useStore((s) => s.isPlaying);
  const volume = useStore((s) => s.musicVolume);
  const muted = useStore((s) => s.muted);
  const [browsing, setBrowsing] = useState(false);

  if (!started) return null;
  const track = playlist[trackIndex] ?? playlist[0];

  return (
    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
      <div className={styles.now}>
        <span className={styles.label}>Now playing</span>
        <span className={styles.title}>
          {track.composer} — {track.title}
        </span>
        <span className={styles.meta}>
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

      <button
        className={styles.browseToggle}
        onClick={() => setBrowsing((v) => !v)}
      >
        {browsing ? "▾ Hide playlist" : `▸ Browse playlist (${playlist.length})`}
      </button>

      {browsing && (
        <ul className={styles.list}>
          {playlist.map((t, i) => (
            <li key={t.filename}>
              <button
                className={styles.trackRow}
                data-current={i === trackIndex}
                onClick={() => playTrack(i)}
              >
                <span className={styles.rowComposer}>{t.composer}</span>
                <span className={styles.rowTitle}>{t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
