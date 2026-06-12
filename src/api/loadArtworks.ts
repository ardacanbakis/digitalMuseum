import { manifest } from "../data/manifest";
import type { ArtworkEntry, FetchedArtwork, RoomId } from "../data/types";
import { useStore } from "../store";
import type { ArtworkRecord } from "../store/artworkSlice";
import { fetchCommonsImageUrls, type CommonsImageUrls } from "./commons";
import { mapWithConcurrency } from "./http";
import { fetchWikipediaSummary, type WikipediaSummary } from "./wikipedia";
import {
  fetchLabels,
  fetchWikidataFacts,
  type WikidataFacts,
} from "./wikidata";

const SUMMARY_CONCURRENCY = 6;

function assemble(
  entry: ArtworkEntry,
  summary: WikipediaSummary | undefined,
  facts: WikidataFacts | undefined,
  labels: Record<string, string>,
  imageUrls: CommonsImageUrls | undefined,
): FetchedArtwork {
  const label = (id: string) => labels[id];
  const joinLabels = (ids: string[]) =>
    ids.map(label).filter(Boolean).join(", ") || undefined;

  return {
    wikidataId: entry.wikidataId,
    title: summary?.title ?? entry.wikipediaTitle,
    artist: facts ? joinLabels(facts.creatorIds) : undefined,
    year: facts?.inceptionYear,
    medium: facts ? joinLabels(facts.materialIds) : undefined,
    heightCm: facts?.heightCm,
    widthCm: facts?.widthCm,
    collection: facts
      ? joinLabels(
          facts.collectionIds.length > 0
            ? facts.collectionIds
            : facts.locationIds,
        )
      : undefined,
    movement: facts ? joinLabels(facts.movementIds) : undefined,
    extract: summary?.extract,
    wikipediaUrl: summary?.pageUrl,
    imageFilename: facts?.imageFilename,
    imageUrlSmall: imageUrls?.small ?? summary?.thumbnailUrl,
    imageUrlLarge: imageUrls?.large ?? summary?.thumbnailUrl,
    thumbnailUrl: summary?.thumbnailUrl,
  };
}

/**
 * Lazily load all artwork data for a room: Wikipedia summaries (bounded
 * concurrency), one batched Wikidata facts call, then one batched label
 * resolution for every linked entity. Entries already loading/loaded are
 * skipped; failed entries are retried on the next call.
 */
export async function loadRoomArtworks(room: RoomId): Promise<void> {
  const { artworkData, mergeArtworkRecords } = useStore.getState();
  const entries = manifest.filter((e) => e.room === room);
  const todo = entries.filter(
    (e) => artworkData[e.wikidataId] === undefined ||
      artworkData[e.wikidataId]?.status === "error",
  );
  if (todo.length === 0) return;

  mergeArtworkRecords(
    Object.fromEntries(
      todo.map((e) => [e.wikidataId, { status: "loading" } as ArtworkRecord]),
    ),
  );

  // Kick both sources off in parallel; each fetch retries once internally.
  const factsPromise = fetchWikidataFacts(todo.map((e) => e.wikidataId)).catch(
    () => ({}) as Record<string, WikidataFacts>,
  );
  const summaries = await mapWithConcurrency(
    todo,
    SUMMARY_CONCURRENCY,
    (e) =>
      fetchWikipediaSummary(e.wikipediaTitle).catch(() => undefined),
  );
  const facts = await factsPromise;

  const filenames = todo
    .map((e) => facts[e.wikidataId]?.imageFilename)
    .filter((f): f is string => Boolean(f));
  const imageUrlsPromise = fetchCommonsImageUrls(filenames).catch(
    () => ({}) as Record<string, CommonsImageUrls>,
  );

  const linkedIds = todo.flatMap((e) => {
    const f = facts[e.wikidataId];
    if (!f) return [];
    return [
      ...f.creatorIds,
      ...f.materialIds,
      ...f.collectionIds,
      ...f.locationIds,
      ...f.movementIds,
    ];
  });
  const labels =
    linkedIds.length > 0
      ? await fetchLabels(linkedIds).catch(
          () => ({}) as Record<string, string>,
        )
      : {};
  const imageUrlMap = await imageUrlsPromise;

  const records: Record<string, ArtworkRecord> = {};
  todo.forEach((entry, i) => {
    const summary = summaries[i];
    const entityFacts = facts[entry.wikidataId];
    if (!summary && !entityFacts) {
      // Both sources failed even after retries → title-only placeholder
      records[entry.wikidataId] = {
        status: "error",
        data: { wikidataId: entry.wikidataId, title: entry.wikipediaTitle },
        error: "Could not reach Wikipedia/Wikidata",
      };
    } else {
      records[entry.wikidataId] = {
        status: "loaded",
        data: assemble(
          entry,
          summary,
          entityFacts,
          labels,
          entityFacts?.imageFilename
            ? imageUrlMap[entityFacts.imageFilename]
            : undefined,
        ),
      };
    }
  });
  mergeArtworkRecords(records);
}
