import { loadRoomArtworks } from "../api/loadArtworks";
import { manifestById } from "./manifest";

/**
 * Ordered highlight reel for the guided tour — iconic works spanning the
 * eras, arranged as a loose chronological narrative. Every id exists in
 * the manifest.
 */
export const TOUR_IDS: string[] = [
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

/** Kick off data loading for every room a tour highlight lives in. */
export function loadTourData(): void {
  const rooms = new Set(
    TOUR_IDS.map((id) => manifestById.get(id)?.room).filter(
      (r): r is NonNullable<typeof r> => Boolean(r),
    ),
  );
  for (const room of rooms) void loadRoomArtworks(room);
}
