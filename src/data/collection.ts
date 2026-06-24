import { loadRoomArtworks } from "../api/loadArtworks";
import { allRooms } from "../scene/rooms/roomDefs";
import { manifest, manifestById } from "./manifest";
import type { RoomId } from "./types";

export interface Group {
  key: string;
  label: string;
  ids: string[];
  kind: "highlights" | "era" | "artist";
}

/**
 * Ordered highlight reel for the default guided tour — iconic works
 * spanning the eras as a loose chronological narrative. Every id exists
 * in the manifest.
 */
export const HIGHLIGHT_IDS: string[] = [
  "Q12418", // Mona Lisa
  "Q151047", // The Birth of Venus
  "Q500242", // The Creation of Adam
  "Q321303", // The Garden of Earthly Delights
  "Q179900", // David (Michelangelo)
  "Q219831", // The Night Watch
  "Q185372", // Girl with a Pearl Earring
  "Q208758", // Las Meninas
  "Q1091086", // The Third of May 1808
  "Q29530", // Liberty Leading the People
  "Q311243", // Wanderer above the Sea of Fog
  "Q328523", // Impression, Sunrise
  "Q45585", // The Starry Night
  "Q1044742", // A Sunday Afternoon ... La Grande Jatte
  "Q471379", // The Scream
  "Q698487", // The Kiss (Klimt)
  "Q25729", // The Persistence of Memory
  "Q151952", // Venus de Milo
  "Q18003128", // The Thinker
];

export const highlightsGroup: Group = {
  key: "highlights",
  label: "Highlights",
  ids: HIGHLIGHT_IDS,
  kind: "highlights",
};

/** The six era/movement rooms, in gallery order, as selectable groups. */
export function eraGroups(): Group[] {
  return allRooms
    .filter((r) => r.id !== "lobby")
    .map((r) => ({
      key: r.id,
      label: r.name,
      ids: manifest.filter((e) => e.room === r.id).map((e) => e.wikidataId),
      kind: "era" as const,
    }));
}

/** Every artist with at least one work, alphabetical, as selectable groups. */
export function artistGroups(): Group[] {
  const byArtist = new Map<string, string[]>();
  for (const e of manifest) {
    const list = byArtist.get(e.artist) ?? [];
    list.push(e.wikidataId);
    byArtist.set(e.artist, list);
  }
  return [...byArtist.entries()]
    .map(([artist, ids]) => ({
      key: `artist:${artist}`,
      label: artist,
      ids,
      kind: "artist" as const,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Load fetched data for every room touched by the given artwork ids. */
export function loadIdsData(ids: string[]): void {
  const rooms = new Set<RoomId>();
  for (const id of ids) {
    const room = manifestById.get(id)?.room;
    if (room) rooms.add(room);
  }
  for (const room of rooms) void loadRoomArtworks(room);
}
