import { useEffect, useState } from "react";
import { useStore } from "../store";
import { closeInspect } from "../scene/artworks/interaction";
import { usePointerLock } from "../scene/player/usePointerLock";
import { isTouchDevice } from "../scene/player/input";
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
  ["ESC / click away", "Put the painting back"],
  ["ESC (walking)", "Open & close this menu"],
];

export function Hud() {
  const viewMode = useStore((s) => s.viewMode);
  const hoveredArt = useStore((s) =>
    s.hoveredArtwork ? (s.artworkData[s.hoveredArtwork]?.data ?? null) : null,
  );
  const { enter, exit } = usePointerLock();
  const touch = isTouchDevice();
  const [showAbout, setShowAbout] = useState(false);

  // All ESC behavior lives in this one handler so modes never fight:
  // inspecting → put the painting back; walking (unlocked) → menu;
  // menu → re-enter. While pointer-locked, the browser itself turns ESC
  // into an unlock, which lands in walking→menu via pointerlockchange.
  useEffect(() => {
    if (touch) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const state = useStore.getState();
      if (state.viewMode === "inspecting") closeInspect();
      else if (document.pointerLockElement) return;
      else if (state.viewMode === "menu") enter();
      else state.setViewMode("menu");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [touch, enter]);

  if (viewMode === "menu") {
    return (
      <div className={styles.menu} onClick={enter}>
        <h1 className={styles.title}>Digital Museum</h1>
        <p className={styles.subtitle}>A walkable gallery of canonical art</p>
        <button className={styles.enterButton} onClick={enter}>
          Enter Museum
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
            <p className={styles.hint}>Click anywhere or press ESC to enter</p>
          </>
        )}
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

  if (viewMode === "inspecting") return null;

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
