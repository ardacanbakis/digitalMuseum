import { useEffect, useState } from "react";
import { useStore } from "../store";
import { nextTrack, startMusic, togglePlay } from "../audio/musicEngine";
import { closeInspect } from "../scene/artworks/interaction";
import { requestLock, usePointerLock } from "../scene/player/usePointerLock";
import { isTouchDevice } from "../scene/player/input";
import { MusicPanel } from "./MusicPanel";
import styles from "./Hud.module.css";

const KEYBINDINGS: [keys: string, action: string][] = [
  ["W A S D / ↑←↓→", "Move"],
  ["Q / E", "Strafe left / right"],
  ["Shift (hold)", "Run"],
  ["Mouse", "Look around"],
  ["Click", "Inspect artwork"],
  ["← → / Q E", "Browse paintings while inspecting"],
  ["Scroll wheel", "Zoom while inspecting"],
  ["Click + drag", "Pan across the painting when zoomed"],
  ["‹ › on screen", "Browse paintings while inspecting"],
  ["Ctrl / ⌘ + Space", "Search a painting & teleport"],
  ["M", "Museum map & teleport"],
  ["N / P", "Next track / play-pause music"],
  ["ESC / Space / dbl-click", "Put the painting back"],
  ["ESC (walking)", "Open menu (music & controls)"],
];

/** Toggle the floor-plan overlay from walking mode (and back). */
function toggleMap() {
  const state = useStore.getState();
  if (state.viewMode === "walking") {
    state.setViewMode("map");
    if (document.pointerLockElement) document.exitPointerLock();
  } else if (state.viewMode === "map") {
    state.setViewMode("walking");
    if (!isTouchDevice()) requestLock();
  }
}

/** Open the search palette from walking / inspecting / map. */
function openSearch() {
  const state = useStore.getState();
  if (state.viewMode === "menu" || state.viewMode === "tour") return;
  state.setSelectedArtwork(null);
  state.setViewMode("search");
  if (document.pointerLockElement) document.exitPointerLock();
}

export function Hud() {
  const viewMode = useStore((s) => s.viewMode);
  const hoveredArt = useStore((s) =>
    s.hoveredArtwork ? (s.artworkData[s.hoveredArtwork]?.data ?? null) : null,
  );
  const { enter, exit } = usePointerLock();
  const touch = isTouchDevice();
  const [showAbout, setShowAbout] = useState(false);

  // All ESC behavior lives in this one handler so modes never fight:
  // inspecting → put the painting back; map → close map; walking
  // (unlocked) → menu; menu → re-enter. While pointer-locked, the browser
  // itself turns ESC into an unlock, landing in walking→menu via
  // pointerlockchange. M toggles the museum map.
  useEffect(() => {
    if (touch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && (e.metaKey || e.ctrlKey) && !e.repeat) {
        e.preventDefault();
        openSearch();
        return;
      }
      if (e.code === "KeyM" && !e.repeat) {
        toggleMap();
        return;
      }
      if (useStore.getState().viewMode !== "menu" && !e.repeat) {
        if (e.code === "KeyN") {
          nextTrack();
          return;
        }
        if (e.code === "KeyP") {
          togglePlay();
          return;
        }
      }
      if (e.key !== "Escape") return;
      const state = useStore.getState();
      if (state.viewMode === "inspecting") closeInspect();
      else if (state.viewMode === "map") toggleMap();
      else if (state.viewMode === "search") {
        state.setViewMode("walking");
        if (!touch) requestLock();
      } else if (state.viewMode === "tour") state.setViewMode("menu");
      else if (document.pointerLockElement) return;
      else if (state.viewMode === "menu") enter();
      else state.setViewMode("menu");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [touch, enter]);

  if (viewMode === "menu") {
    const firstVisit = !useStore.getState().musicStarted;
    return (
      <div className={styles.menu} onClick={firstVisit ? undefined : enter}>
        <h1 className={styles.title}>Digital Museum</h1>
        <p className={styles.subtitle}>A walkable gallery of canonical art</p>
        {firstVisit ? (
          <div className={styles.enterRow}>
            <button
              className={styles.enterButton}
              onClick={() => {
                startMusic(true);
                enter();
              }}
            >
              Enter with sound
            </button>
            <button
              className={`${styles.enterButton} ${styles.enterMuted}`}
              onClick={() => {
                startMusic(false);
                enter();
              }}
            >
              Enter muted
            </button>
          </div>
        ) : (
          <button className={styles.enterButton} onClick={enter}>
            Return to Museum
          </button>
        )}
        <button
          className={styles.tourButton}
          onClick={(e) => {
            e.stopPropagation();
            startMusic(true);
            useStore.getState().setViewMode("tour");
          }}
        >
          ✦ Take a guided tour
        </button>
        {touch ? (
          <p className={styles.hint}>
            Left side: joystick to walk · Right side: drag to look, tap a
            painting to inspect
          </p>
        ) : (
          <>
            <div
              className={styles.keybindings}
              onClick={(e) => e.stopPropagation()}
            >
              {KEYBINDINGS.map(([keys, action]) => (
                <div key={action} className={styles.keyRow}>
                  <kbd>{keys}</kbd>
                  <span>{action}</span>
                </div>
              ))}
            </div>
            {!firstVisit && (
              <p className={styles.hint}>
                Click anywhere or press ESC to enter
              </p>
            )}
          </>
        )}
        <MusicPanel />
        <button
          className={styles.aboutButton}
          aria-label="About this museum"
          onClick={(e) => {
            e.stopPropagation();
            setShowAbout((v) => !v);
          }}
        >
          i
        </button>
        {showAbout && (
          <div className={styles.about} onClick={(e) => e.stopPropagation()}>
            <p>
              Every artwork in this museum is loaded live from{" "}
              <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer">
                Wikipedia
              </a>
              ,{" "}
              <a href="https://www.wikidata.org" target="_blank" rel="noreferrer">
                Wikidata
              </a>{" "}
              and{" "}
              <a
                href="https://commons.wikimedia.org"
                target="_blank"
                rel="noreferrer"
              >
                Wikimedia Commons
              </a>
              — nothing is bundled with the app. Walk up to any painting and
              click it for details, sources and attribution.
            </p>
            <p>
              Data is cached locally for a week to keep revisits fast and be
              polite to Wikimedia’s servers.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (
    viewMode === "inspecting" ||
    viewMode === "map" ||
    viewMode === "search" ||
    viewMode === "tour"
  ) {
    return null;
  }

  return (
    <>
      {!touch && (
        <div className={styles.crosshair} data-hovered={hoveredArt !== null} />
      )}
      {hoveredArt && (
        <div className={styles.tooltip}>
          <strong>{hoveredArt.title}</strong>
          {(hoveredArt.artist || hoveredArt.year) && (
            <span className={styles.tooltipMeta}>
              {hoveredArt.artist}
              {hoveredArt.artist && hoveredArt.year ? ", " : ""}
              {hoveredArt.year}
            </span>
          )}
        </div>
      )}
      {touch && (
        <>
          <button
            className={styles.exitButton}
            onClick={exit}
            aria-label="Back to menu"
          >
            ✕
          </button>
          <button
            className={styles.mapButton}
            onClick={toggleMap}
            aria-label="Museum map"
          >
            🗺
          </button>
        </>
      )}
    </>
  );
}
