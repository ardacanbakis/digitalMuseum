import { commonsFilePageUrl } from "../api/commons";
import { STRINGS } from "../data/i18n";
import { manifestById } from "../data/manifest";
import { closeInspect, navigateArtwork } from "../scene/artworks/interaction";
import { useStore } from "../store";
import styles from "./InfoPanel.module.css";

export function InfoPanel() {
  const selectedId = useStore((s) => s.selectedArtwork);
  const record = useStore((s) =>
    s.selectedArtwork ? s.artworkData[s.selectedArtwork] : undefined,
  );
  const t = STRINGS[useStore((s) => s.settings.language)];

  if (!selectedId) return null;
  const art = record?.data;
  const isSculpture = manifestById.get(selectedId)?.type === "sculpture";

  const facts: [label: string, value: string | undefined][] = [
    [t.artist, art?.artist],
    [t.year, art?.year],
    [t.medium, art?.medium],
    [
      t.dimensions,
      art?.heightCm !== undefined && art?.widthCm !== undefined
        ? `${art.heightCm} × ${art.widthCm} cm`
        : undefined,
    ],
    [t.location, art?.collection],
    [t.movement, art?.movement],
  ];

  return (
    <>
      <button
        className={`${styles.navArrow} ${styles.navPrev}`}
        onClick={() => navigateArtwork(-1)}
        aria-label="Previous artwork"
      >
        ‹
      </button>
      <button
        className={`${styles.navArrow} ${styles.navNext}`}
        onClick={() => navigateArtwork(1)}
        aria-label="Next artwork"
      >
        ›
      </button>
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
        {isSculpture && (
          <p className={styles.sculptureNote}>{t.sculptureNote}</p>
        )}
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
          <p className={styles.error}>{t.detailsError}</p>
        )}
        <footer className={styles.attribution}>
          <span>{t.source}</span>
          <span className={styles.attributionLinks}>
            {art?.wikipediaUrl && (
              <a href={art.wikipediaUrl} target="_blank" rel="noreferrer">
                {t.wikiArticle}
              </a>
            )}
            {art?.imageFilename && (
              <a
                href={commonsFilePageUrl(art.imageFilename)}
                target="_blank"
                rel="noreferrer"
              >
                {t.imageFile}
              </a>
            )}
          </span>
        </footer>
        <p className={styles.hint}>{t.panelHint}</p>
      </div>
      </aside>
    </>
  );
}
