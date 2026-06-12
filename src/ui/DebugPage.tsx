import { useEffect, useMemo, useState } from "react";
import { cacheClear } from "../api/cache";
import { commonsFilePageUrl, commonsImageUrl } from "../api/commons";
import { loadRoomArtworks } from "../api/loadArtworks";
import { manifest } from "../data/manifest";
import type { RoomId } from "../data/types";
import { useStore } from "../store";
import styles from "./DebugPage.module.css";

/**
 * Data-pipeline verification page (open with ?debug). Lists every manifest
 * entry with its fetched data so we can confirm all IDs resolve before
 * anything touches the 3D scene.
 */
export function DebugPage() {
  const rooms = useMemo(
    () => [...new Set(manifest.map((e) => e.room))],
    [],
  );
  const [room, setRoom] = useState<RoomId>(rooms[0]);
  const [reloadKey, setReloadKey] = useState(0);
  const artworkData = useStore((s) => s.artworkData);

  useEffect(() => {
    void loadRoomArtworks(room);
  }, [room, reloadKey]);

  const entries = manifest.filter((e) => e.room === room);
  const counts = entries.reduce(
    (acc, e) => {
      const status = artworkData[e.wikidataId]?.status ?? "idle";
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Data Pipeline Debug</h1>
        <div className={styles.controls}>
          <label>
            Room{" "}
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value as RoomId)}
            >
              {rooms.map((r) => (
                <option key={r} value={r}>
                  {r} ({manifest.filter((e) => e.room === r).length})
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              cacheClear();
              setReloadKey((k) => k + 1);
            }}
          >
            Clear cache & refetch
          </button>
          <span className={styles.counts}>
            {entries.length} entries · {counts.loaded ?? 0} loaded ·{" "}
            {counts.loading ?? 0} loading · {counts.error ?? 0} failed
          </span>
        </div>
        <p className={styles.note}>
          Back to the museum: remove <code>?debug</code> from the URL.
        </p>
      </header>

      <div className={styles.grid}>
        {entries.map((entry) => {
          const record = artworkData[entry.wikidataId];
          const art = record?.data;
          const img = art?.imageFilename
            ? commonsImageUrl(art.imageFilename, 256)
            : art?.thumbnailUrl;
          return (
            <article key={entry.wikidataId} className={styles.card}>
              <div className={styles.thumbWrap}>
                {img ? (
                  <img src={img} alt={art?.title ?? entry.wikipediaTitle} loading="lazy" />
                ) : (
                  <div className={styles.noImage}>
                    {record?.status === "loading" ? "loading…" : "no image"}
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <h2>
                  {art?.title ?? entry.wikipediaTitle}{" "}
                  <span
                    className={styles.status}
                    data-status={record?.status ?? "idle"}
                  >
                    {record?.status ?? "idle"}
                  </span>
                </h2>
                <dl>
                  {art?.artist && (
                    <>
                      <dt>Artist</dt>
                      <dd>{art.artist}</dd>
                    </>
                  )}
                  {art?.year && (
                    <>
                      <dt>Year</dt>
                      <dd>{art.year}</dd>
                    </>
                  )}
                  {art?.medium && (
                    <>
                      <dt>Medium</dt>
                      <dd>{art.medium}</dd>
                    </>
                  )}
                  {art?.heightCm !== undefined && art?.widthCm !== undefined && (
                    <>
                      <dt>Size</dt>
                      <dd>
                        {art.heightCm} × {art.widthCm} cm
                      </dd>
                    </>
                  )}
                  {art?.collection && (
                    <>
                      <dt>Location</dt>
                      <dd>{art.collection}</dd>
                    </>
                  )}
                  {art?.movement && (
                    <>
                      <dt>Movement</dt>
                      <dd>{art.movement}</dd>
                    </>
                  )}
                </dl>
                {art?.extract && <p className={styles.extract}>{art.extract}</p>}
                {record?.error && (
                  <p className={styles.error}>{record.error}</p>
                )}
                <p className={styles.links}>
                  <a
                    href={`https://www.wikidata.org/wiki/${entry.wikidataId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {entry.wikidataId}
                  </a>
                  {art?.wikipediaUrl && (
                    <a href={art.wikipediaUrl} target="_blank" rel="noreferrer">
                      Wikipedia
                    </a>
                  )}
                  {art?.imageFilename && (
                    <a
                      href={commonsFilePageUrl(art.imageFilename)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Commons file
                    </a>
                  )}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
