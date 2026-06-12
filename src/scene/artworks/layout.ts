import { entriesForRoom } from "../../data/manifest";
import type { FetchedArtwork } from "../../data/types";
import { EYE_HEIGHT } from "../player/collision";
import type { RoomDef } from "../rooms/roomDefs";

export interface Placement {
  artworkId: string;
  /** Painting center, nudged slightly off the wall plane. */
  position: [number, number, number];
  rotationY: number;
  /** XZ wall normal pointing into the room. */
  normal: [number, number];
  /** Widest a painting may render in this slot without crowding neighbors. */
  maxWidth: number;
}

const PAINTING_CENTER_Y = 1.5;
const WALL_MARGIN = 1.4; // keep clear of corners (and doorways in Phase 4)
const WALL_OFFSET = 0.05;
const MAX_HEIGHT = 2.2;

interface WallSpec {
  axis: "x" | "z";
  fixed: number;
  normal: [number, number];
  rotationY: number;
  length: number;
  center: number;
  /** Traverse the wall backwards so slot order runs clockwise around the room. */
  reverse: boolean;
}

/** Walls in clockwise perimeter order (N→E→S→W), so that "next painting"
 * navigation in inspect mode walks naturally around the room. */
function wallSpecs(room: RoomDef): WallSpec[] {
  const [cx, cz] = room.center;
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const lengthX = room.width - WALL_MARGIN * 2;
  const lengthZ = room.depth - WALL_MARGIN * 2;
  return [
    { axis: "x", fixed: cz - hd, normal: [0, 1], rotationY: 0, length: lengthX, center: cx, reverse: false },
    { axis: "z", fixed: cx + hw, normal: [-1, 0], rotationY: -Math.PI / 2, length: lengthZ, center: cz, reverse: false },
    { axis: "x", fixed: cz + hd, normal: [0, -1], rotationY: Math.PI, length: lengthX, center: cx, reverse: true },
    { axis: "z", fixed: cx - hw, normal: [1, 0], rotationY: Math.PI / 2, length: lengthZ, center: cz, reverse: true },
  ];
}

/** Apportion n slots across walls proportionally to length (largest remainder). */
function apportion(lengths: number[], n: number): number[] {
  const total = lengths.reduce((a, b) => a + b, 0);
  const exact = lengths.map((l) => (n * l) / total);
  const counts = exact.map(Math.floor);
  let remaining = n - counts.reduce((a, b) => a + b, 0);
  const order = exact
    .map((e, i) => ({ frac: e - Math.floor(e), i }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remaining-- <= 0) break;
    counts[i]++;
  }
  return counts;
}

function computePlacements(room: RoomDef): Map<string, Placement> {
  const entries = entriesForRoom(room.id).filter((e) => e.type === "painting");
  const walls = wallSpecs(room);
  const counts = apportion(
    walls.map((w) => w.length),
    entries.length,
  );

  const placements = new Map<string, Placement>();
  let i = 0;
  walls.forEach((wall, wi) => {
    const count = counts[wi];
    if (count === 0) return;
    const spacing = wall.length / count;
    for (let s = 0; s < count && i < entries.length; s++, i++) {
      const offset = spacing * (s + 0.5);
      const t = wall.reverse
        ? wall.center + wall.length / 2 - offset
        : wall.center - wall.length / 2 + offset;
      const x =
        wall.axis === "x" ? t : wall.fixed + wall.normal[0] * WALL_OFFSET;
      const z =
        wall.axis === "x" ? wall.fixed + wall.normal[1] * WALL_OFFSET : t;
      const entry = entries[i];
      placements.set(entry.wikidataId, {
        artworkId: entry.wikidataId,
        position: [x, PAINTING_CENTER_Y, z],
        rotationY: wall.rotationY,
        normal: wall.normal,
        maxWidth: spacing * 0.82,
      });
    }
  });
  return placements;
}

const placementCache = new Map<string, Map<string, Placement>>();

export function getRoomPlacements(room: RoomDef): Map<string, Placement> {
  let placements = placementCache.get(room.id);
  if (!placements) {
    placements = computePlacements(room);
    placementCache.set(room.id, placements);
  }
  return placements;
}

/** Artwork ids in clockwise hanging order — the inspect-mode browse order. */
export function getRoomArtworkOrder(room: RoomDef): string[] {
  return [...getRoomPlacements(room).keys()];
}

export interface FocusPose {
  cameraPosition: [number, number, number];
  lookTarget: [number, number, number];
  /** Where the painting floats to, popped off the wall toward the viewer. */
  paintingPosition: [number, number, number];
}

/**
 * Shared focus geometry for inspect mode: the camera stands back from the
 * wall at a distance scaled to the artwork, and the painting pops out
 * toward the viewer — shifted slightly camera-left on wide screens so the
 * info panel on the right never covers it.
 */
export function computeFocusPose(
  placement: Placement,
  width: number,
  height: number,
): FocusPose {
  const [nx, nz] = placement.normal;
  const [bx, , bz] = placement.position;
  const distance = Math.min(4, Math.max(1.6, Math.max(width, height) * 1.25));
  const pop = distance * 0.42;
  const shift =
    typeof window !== "undefined" && window.innerWidth > 640
      ? distance * 0.12
      : 0;
  // camera faces -normal; its left along the wall is (-nz, nx)
  const leftX = -nz;
  const leftZ = nx;
  return {
    cameraPosition: [bx + nx * distance, EYE_HEIGHT, bz + nz * distance],
    lookTarget: [bx, EYE_HEIGHT, bz],
    paintingPosition: [
      bx + nx * pop + leftX * shift,
      EYE_HEIGHT,
      bz + nz * pop + leftZ * shift,
    ],
  };
}

/**
 * Painting size in meters: real Wikidata dimensions when available
 * (clamped to fit the slot), else texture aspect at a default height.
 */
export function paintingSize(
  art: Pick<FetchedArtwork, "heightCm" | "widthCm"> | undefined,
  textureAspect: number | null,
  maxWidth: number,
): [width: number, height: number] {
  let w: number;
  let h: number;
  if (art?.heightCm && art?.widthCm) {
    h = art.heightCm / 100;
    w = art.widthCm / 100;
  } else if (textureAspect) {
    h = 1.3;
    w = h * textureAspect;
  } else {
    return [1.2, 1.5];
  }
  let scale = 1;
  if (h * scale > MAX_HEIGHT) scale = MAX_HEIGHT / h;
  if (w * scale > maxWidth) scale = maxWidth / w;
  if (h * scale < 0.7) scale = 0.7 / h;
  return [w * scale, h * scale];
}
