import { useEffect, useState } from "react";
import { useStore } from "../store";
import { nextTrack, startMusic, togglePlay } from "../audio/musicEngine";
import { requestLock, usePointerLock } from "../scene/player/usePointerLock";
import { isEditableTarget, isTouchDevice } from "../scene/player/input";
import { frameById } from "../data/lobbyFrames";
import { BrowsePanel } from "./BrowsePanel";
import { MusicPanel } from "./MusicPanel";
import { TourSetup } from "./TourSetup";
import styles from "./Hud.module.css";

const KEYBINDINGS: [keys: string, action: string][] = [
  ["W A S D / ↑←↓→", "Move"],
  ["Q / E", "Strafe left / right"],
  ["Shift (hold)", "Run"],
  ["Mouse", "Look around"],
  ["Click", "Inspect artwork"],
  ["‹ › / ← →", "Browse paintings while inspecting"],
  ["Scroll / drag", "Zoom & pan a focused painting"],
  ["Space", "Search a painting & teleport"],
  ["M", "Museum map & teleport"],
  ["N / P", "Next track / play-pause music"],
  ["ESC / dbl-click", "Put the painting back"],
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

/** Show the pause menu (releases the mouse). */
function openMenu() {
  const state = useStore.getState();
  state.setViewMode("menu");
  if (document.pointerLockElement) document.exitPointerLock();
}

export function Hud() {
  const viewMode = useStore((s) => s.viewMode);
  const hoveredArt = useStore((s) =>
    s.hoveredArtwork ? (s.artworkData[s.hoveredArtwork]?.data ?? null) : null,
  );
  const hoveredFrameTitle = useStore((s) =>
    s.hoveredFrame ? (frameById.get(s.hoveredFrame)?.title ?? null) : null,
  );
  const { enter } = usePointerLock();
  const touch = isTouchDevice();
  const [showAbout, setShowAbout] = useState(false);
  const [panel, setPanel] = useState<null | "tour" | "browse">(null);

  // All ESC behavior lives in this one handler so modes never fight:
  // inspecting → put the painting back; map → close map; walking
  // (unlocked) → menu; menu → re-enter. While pointer-locked, the browser
  // itself turns ESC into an unlock, landing in walking→menu via
  // pointerlockchange. M toggles the museum map.
  useEffect(() => {
    if (touch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // Typing in the search box (or any field) must not trigger shortcuts
      if (isEditableTarget(e.target)) return;
      if (
        e.code === "Space" &&
        !e.repeat &&
        useStore.getState().viewMode === "walking"
      ) {
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
      // ESC never tries to (re)acquire pointer lock — the browser treats
      // ESC as "exit lock", so locking here would instantly bounce back
      // and pop the menu. We move to the target unlocked state and let
      // click-to-relock take over.
      const state = useStore.getState();
      if (state.viewMode === "inspecting") {
        state.setSelectedArtwork(null);
        state.setViewMode("walking"); // only the painting closes
      } else if (state.viewMode === "frame") {
        state.setSelectedFrame(null);
        state.setViewMode("walking");
      } else if (state.viewMode === "map" || state.viewMode === "search") {
        state.setViewMode("walking");
      } else if (state.viewMode === "tour") {
        state.setViewMode("menu");
      } else if (document.pointerLockElement) {
        // walking + locked: let the browser exit lock → onChange → menu
        return;
      } else if (state.viewMode === "menu") {
        state.setViewMode("walking"); // resume (unlocked; click to look)
      } else {
        state.setViewMode("menu"); // walking + already unlocked
      }
    };

    // Right mouse button toggles the menu (works even while pointer-locked)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return;
      const mode = useStore.getState().viewMode;
      if (mode === "walking") openMenu();
      else if (mode === "menu") enter();
    };
    const onContextMenu = (e: MouseEvent) => {
      if (!isEditableTarget(e.target)) e.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("contextmenu", onContextMenu);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("contextmenu", onContextMenu);
    };
  }, [touch, enter]);

  if (viewMode === "menu") {
    const firstVisit = !useStore.getState().musicStarted;
    return (
      <>
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
        <div className={styles.tourRow}>
          <button
            className={styles.tourButton}
            onClick={(e) => {
              e.stopPropagation();
              setPanel("tour");
            }}
          >
            ✦ Guided tour
          </button>
          <button
            className={styles.tourButton}
            onClick={(e) => {
              e.stopPropagation();
              setPanel("browse");
            }}
          >
            ☰ Browse collection
          </button>
          <button
            className={styles.tourButton}
            onClick={(e) => {
              e.stopPropagation();
              useStore.getState().setViewMode("map");
            }}
          >
            🗺 Museum map
          </button>
        </div>
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
      {panel === "tour" && (
        <TourSetup
          onClose={() => setPanel(null)}
          onBrowse={() => setPanel("browse")}
        />
      )}
      {panel === "browse" && <BrowsePanel onClose={() => setPanel(null)} />}
      </>
    );
  }

  if (
    viewMode === "inspecting" ||
    viewMode === "map" ||
    viewMode === "search" ||
    viewMode === "tour" ||
    viewMode === "frame"
  ) {
    return null;
  }

  return (
    <>
      {!touch && (
        <div
          className={styles.crosshair}
          data-hovered={hoveredArt !== null || hoveredFrameTitle !== null}
        />
      )}
      {hoveredArt ? (
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
      ) : hoveredFrameTitle ? (
        <div className={styles.tooltip}>
          <strong>{hoveredFrameTitle}</strong>
        </div>
      ) : null}
      {/* Desktop hides the cursor during look-around, so on-screen buttons
          aren't clickable there — menu is via ESC / right-click. Touch
          keeps the on-screen menu + map buttons. */}
      {touch && (
        <button
          className={styles.menuButton}
          onClick={openMenu}
          aria-label="Menu"
        >
          ☰
        </button>
      )}
      {touch && (
        <button
          className={styles.mapButton}
          onClick={toggleMap}
          aria-label="Museum map"
        >
          🗺
        </button>
      )}
    </>
  );
}
