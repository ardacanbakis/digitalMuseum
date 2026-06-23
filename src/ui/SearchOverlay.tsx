import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { manifest } from "../data/manifest";
import { roomById } from "../scene/rooms/roomDefs";
import { teleportToArtwork } from "../scene/artworks/interaction";
import { isTouchDevice } from "../scene/player/input";
import { requestLock } from "../scene/player/usePointerLock";
import { useStore } from "../store";
import styles from "./SearchOverlay.module.css";

const MAX_RESULTS = 8;

interface Result {
  id: string;
  title: string;
  subtitle: string;
}

/**
 * Search palette (Ctrl/⌘+Space): type a painting or artist, pick a result,
 * and teleport to stand in front of it. Matches the manifest title plus
 * any already-fetched artist/title text.
 */
export function SearchOverlay() {
  const open = useStore((s) => s.viewMode === "search");
  const artworkData = useStore((s) => s.artworkData);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after the element mounts
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored: { r: Result; score: number }[] = [];
    for (const entry of manifest) {
      const data = artworkData[entry.wikidataId]?.data;
      const title = data?.title ?? entry.wikipediaTitle;
      const artist = data?.artist ?? "";
      const room = roomById.get(entry.room)?.name ?? "";
      const haystack = `${title} ${artist} ${entry.wikipediaTitle}`.toLowerCase();
      const idx = haystack.indexOf(q);
      if (idx === -1) continue;
      // Prefer matches at the start of the title
      const score = title.toLowerCase().startsWith(q) ? 0 : idx + 1;
      scored.push({
        r: {
          id: entry.wikidataId,
          title,
          subtitle: artist ? `${artist} · ${room}` : room,
        },
        score,
      });
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, MAX_RESULTS).map((s) => s.r);
  }, [query, artworkData]);

  if (!open) return null;

  const close = () => {
    useStore.getState().setViewMode("walking");
    if (!isTouchDevice()) requestLock();
  };

  const choose = (id: string) => {
    teleportToArtwork(id);
    if (!isTouchDevice()) requestLock();
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[active]) choose(results[active].id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  return (
    <div className={styles.backdrop} onClick={close}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Search a painting or artist…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
        />
        {results.length > 0 && (
          <ul className={styles.results}>
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  className={styles.result}
                  data-active={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(r.id)}
                >
                  <span className={styles.resultTitle}>{r.title}</span>
                  <span className={styles.resultSub}>{r.subtitle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {query.trim() && results.length === 0 && (
          <p className={styles.empty}>No matches</p>
        )}
        <p className={styles.hint}>↑↓ to choose · Enter to teleport · ESC to close</p>
      </div>
    </div>
  );
}
