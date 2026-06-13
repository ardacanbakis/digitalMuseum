import { entriesForRoom } from "../../data/manifest";
import type { FetchedArtwork } from "../../data/types";
import { EYE_HEIGHT } from "../player/collision";
import {
  allRooms,
  PEDESTAL_HEIGHT,
  type RoomDef,
  type WallSide,
} from "../rooms/roomDefs";

export interface Placement {
  artworkId: string;
  /** Artwork center, nudged slightly off the wall plane (paintings) or
   * above the pedestal (sculptures). */
  position: [number, number, number];
  rotationY: number;
  /** XZ normal pointing into the room / toward the viewer side. */
  normal: [number, number];
  /** Widest the artwork may render in this slot without crowding. */
  maxWidth: number;
  kind: "wall" | "pedestal";
}

const PAINTING_CENTER_Y = 1.5;
const WALL_MARGIN = 1.4; // keep clear of corners
const DOOR_CLEARANCE = 0.7; // extra space either side of a doorway
const WALL_OFFSET = 0.05;
const MAX_HEIGHT = 2.2;

interface SegmentSpec {
  axis: "x" | "z";
  fixed: number;
  normal: [number, number];
  rotationY: number;
  /** Usable slot range along the wall axis (start < end). */
  start: number;
  end: number;
  /** Fill slots from `end` toward `start` (clockwise traversal). */
  reverse: boolean;
}

const SIDE_GEOMETRY: Record<
  WallSide,
  { normal: [number, number]; rotationY: number; reverse: boolean }
> = {
  north: { normal: [0, 1], rotationY: 0, reverse: false },
  east: { normal: [-1, 0], rotationY: -Math.PI / 2, reverse: false },
  south: { normal: [0, -1], rotationY: Math.PI, reverse: true },
  west: { normal: [1, 0], rotationY: Math.PI / 2, reverse: true },
};

/** Sides in clockwise perimeter order so "next painting" walks the room. */
const SIDE_ORDER: WallSide[] = ["north", "east", "south", "west"];

/** Usable wall segments per side: full span minus corners and door gaps. */
function segmentSpecs(room: RoomDef): SegmentSpec[] {
  const [cx, cz] = room.center;
  const hw = room.width / 2;
  const hd = room.depth / 2;
  const specs: SegmentSpec[] = [];

  for (const side of SIDE_ORDER) {
    const axis: "x" | "z" = side === "north" || side === "south" ? "x" : "z";
    const fixed =
      side === "north"
        ? cz - hd
        : side === "south"
          ? cz + hd
          : side === "west"
            ? cx - hw
            : cx + hw;
    const along = axis === "x" ? cx : cz;
    const half = axis === "x" ? hw : hd;
    const geo = SIDE_GEOMETRY[side];

    const gaps = room.doors
      .filter((d) => d.side === side)
      .map((d) => {
        const at = axis === "x" ? d.center[0] : d.center[1];
        return {
          from: at - d.width / 2 - DOOR_CLEARANCE,
          to: at + d.width / 2 + DOOR_CLEARANCE,
        };
      })
      .sort((a, b) => a.from - b.from);

    let cursor = along - half + WALL_MARGIN;
    const wallEnd = along + half - WALL_MARGIN;
    const pieces: { start: number; end: number }[] = [];
    for (const gap of gaps) {
      if (gap.from > cursor) pieces.push({ start: cursor, end: gap.from });
      cursor = Math.max(cursor, gap.to);
    }
    if (cursor < wallEnd) pieces.push({ start: cursor, end: wallEnd });

    const ordered = geo.reverse ? [...pieces].reverse() : pieces;
    for (const piece of ordered) {
      if (piece.end - piece.start < 1.2) continue; // too small for a slot
      specs.push({
        axis,
        fixed,
        normal: geo.normal,
        rotationY: geo.rotationY,
        start: piece.start,
        end: piece.end,
        reverse: geo.reverse,
      });
    }
  }
  return specs;
}

/** Apportion n slots across segments proportionally (largest remainder). */
function apportion(lengths: number[], n: number): number[] {
  const total = lengths.reduce((a, b) => a + b, 0);
  if (total === 0) return lengths.map(() => 0);
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
  const entries = entriesForRoom(room.id);
  const paintings = entries.filter((e) => e.type === "painting");
  const sculptures = entries.filter((e) => e.type === "sculpture");
  const placements = new Map<string, Placement>();

  // Paintings along wall segments
  const segments = segmentSpecs(room);
  const counts = apportion(
    segments.map((s) => s.end - s.start),
    paintings.length,
  );
  let i = 0;
  // Mount in front of the wall's interior face: walls grow inward by
  // wallThickness from the footprint edge (seg.fixed), so clear that plus
  // a small air gap. This also keeps paintings off any neighbor's wall.
  const mount = room.wallThickness + WALL_OFFSET;
  segments.forEach((seg, si) => {
    const count = counts[si];
    if (count === 0) return;
    const length = seg.end - seg.start;
    const spacing = length / count;
    for (let s = 0; s < count && i < paintings.length; s++, i++) {
      const offset = spacing * (s + 0.5);
      const along = seg.reverse ? seg.end - offset : seg.start + offset;
      const x = seg.axis === "x" ? along : seg.fixed + seg.normal[0] * mount;
      const z = seg.axis === "x" ? seg.fixed + seg.normal[1] * mount : along;
      const entry = paintings[i];
      placements.set(entry.wikidataId, {
        artworkId: entry.wikidataId,
        position: [x, PAINTING_CENTER_Y, z],
        rotationY: seg.rotationY,
        normal: seg.normal,
        maxWidth: spacing * 0.82,
        kind: "wall",
      });
    }
  });

  // Sculptures on pedestals, facing the room center
  const [cx, cz] = room.center;
  (room.pedestals ?? []).forEach((pedestal, pi) => {
    const entry = sculptures[pi];
    if (!entry) return;
    const [px, pz] = pedestal;
    const dx = cx - px;
    const dz = cz - pz;
    const len = Math.hypot(dx, dz) || 1;
    const normal: [number, number] = [dx / len, dz / len];
    placements.set(entry.wikidataId, {
      artworkId: entry.wikidataId,
      position: [px, PEDESTAL_HEIGHT, pz],
      rotationY: Math.atan2(normal[0], normal[1]),
      normal,
      maxWidth: 2.0,
      kind: "pedestal",
    });
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

/** Find an artwork's placement in any room. */
export function getPlacement(artworkId: string): Placement | undefined {
  for (const room of allRooms) {
    const placement = getRoomPlacements(room).get(artworkId);
    if (placement) return placement;
  }
  return undefined;
}

export interface FocusPose {
  cameraPosition: [number, number, number];
  lookTarget: [number, number, number];
  /** Where the artwork floats to, popped toward the viewer. */
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
 * Artwork size in meters: real Wikidata dimensions when available
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
