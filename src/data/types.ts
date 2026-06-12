export type RoomId =
  | "lobby"
  | "renaissance"
  | "baroque"
  | "romanticism"
  | "impressionism"
  | "modern"
  | "sculpture";

/** Hand-curated manifest entry: stable identifiers + layout metadata only. */
export interface ArtworkEntry {
  /** Wikidata item, e.g. "Q12418" — the stable key for all fetched data. */
  wikidataId: string;
  /** Exact en.wikipedia article title (redirects also resolve). */
  wikipediaTitle: string;
  type: "painting" | "sculpture";
  room: RoomId;
  /** Optional layout overrides (used from Phase 3 on). */
  slot?: number;
  scale?: number;
  pedestalHeight?: number;
}

/** Everything we fetched live from Wikipedia/Wikidata/Commons for one work. */
export interface FetchedArtwork {
  wikidataId: string;
  title: string;
  artist?: string;
  /** Display string, e.g. "1872" or "c. 1503". */
  year?: string;
  medium?: string;
  heightCm?: number;
  widthCm?: number;
  collection?: string;
  movement?: string;
  extract?: string;
  wikipediaUrl?: string;
  /** Commons filename from Wikidata P18; image URLs derive from this. */
  imageFilename?: string;
  /** Fallback image when P18 is missing: the Wikipedia page thumbnail. */
  thumbnailUrl?: string;
}
