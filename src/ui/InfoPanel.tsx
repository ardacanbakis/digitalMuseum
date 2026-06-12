import { useEffect } from "react";
import { commonsFilePageUrl } from "../api/commons";
import { closeInspect } from "../scene/artworks/interaction";
import { useStore } from "../store";
import styles from "./InfoPanel.module.css";

export function InfoPanel() {
  const selectedId = useStore((s) => s.selectedArtwork);
  const record = useStore((s) =>
    s.selectedArtwork ? s.artworkData[s.selectedArtwork] : undefined,
  );

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInspect();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  if (!selectedId) return null;
  const art = record?.data;

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
      <button
        className={styles.close}
        onClick={() => closeInspect()}
        aria-label="Close"
      >
        ✕
      </button>
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
        <p className={styles.hint}>
          ← → browse the room · scroll to zoom · ESC or click away to return
          it to the wall
        </p>
      </div>
    </aside>
  );
}
