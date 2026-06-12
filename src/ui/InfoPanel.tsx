import { useEffect } from "react";
import {
  commonsFilePageUrl,
  commonsImageUrl,
  FOCUS_IMAGE_WIDTH,
} from "../api/commons";
import { isTouchDevice } from "../scene/player/input";
import { usePointerLock } from "../scene/player/usePointerLock";
import { useStore } from "../store";
import styles from "./InfoPanel.module.css";

export function InfoPanel() {
  const selectedId = useStore((s) => s.selectedArtwork);
  const record = useStore((s) =>
    s.selectedArtwork ? s.artworkData[s.selectedArtwork] : undefined,
  );
  const setSelectedArtwork = useStore((s) => s.setSelectedArtwork);
  const setViewMode = useStore((s) => s.setViewMode);
  const { enter } = usePointerLock();

  const close = () => {
    setSelectedArtwork(null);
    setViewMode("walking");
    // Desktop: relock the pointer to resume walking; if the browser
    // refuses (lock cooldown), usePointerLock falls back to the menu.
    if (!isTouchDevice()) enter();
  };

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  if (!selectedId) return null;
  const art = record?.data;
  const imageUrl = art?.imageFilename
    ? commonsImageUrl(art.imageFilename, FOCUS_IMAGE_WIDTH)
    : art?.thumbnailUrl;

  const facts: [label: string, value: string | undefined][] = [
    ["Artist", art?.artist],
    ["Year", art?.year],
    ["Medium", art?.medium],
    [
      "Dimensions",
      art?.heightCm !== undefined && art?.widthCm !== undefined
        ? `${art.heightCm} × ${art.widthCm} cm`
        : undefined,
    ],
    ["Location", art?.collection],
    ["Movement", art?.movement],
  ];

  return (
    <aside className={styles.panel}>
      <button className={styles.close} onClick={close} aria-label="Close">
        ✕
      </button>
      {imageUrl && (
        <img
          className={styles.image}
          src={imageUrl}
          alt={art?.title ?? "Artwork"}
        />
      )}
      <div className={styles.body}>
        <h2 className={styles.title}>{art?.title ?? "…"}</h2>
        <dl className={styles.facts}>
          {facts.map(([label, value]) =>
            value ? (
              <div key={label} className={styles.factRow}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ) : null,
          )}
        </dl>
        {art?.extract && <p className={styles.extract}>{art.extract}</p>}
        {record?.status === "error" && (
          <p className={styles.error}>
            Details couldn’t be loaded right now — close and reopen to retry.
          </p>
        )}
        <footer className={styles.attribution}>
          <span>Source: Wikipedia / Wikimedia Commons</span>
          <span className={styles.attributionLinks}>
            {art?.wikipediaUrl && (
              <a href={art.wikipediaUrl} target="_blank" rel="noreferrer">
                Wikipedia article
              </a>
            )}
            {art?.imageFilename && (
              <a
                href={commonsFilePageUrl(art.imageFilename)}
                target="_blank"
                rel="noreferrer"
              >
                Image file
              </a>
            )}
          </span>
        </footer>
        <p className={styles.hint}>ESC or ✕ to keep walking</p>
      </div>
    </aside>
  );
}
