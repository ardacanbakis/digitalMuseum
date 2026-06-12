import type { RoomId } from "../../data/types";

/** Axis-aligned bounding box in the XZ plane (walls span full room height). */
export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** A solid box inside the room that both renders and collides. */
export interface Obstacle {
  aabb: AABB;
  height: number;
  color: string;
}

export type WallSide = "north" | "south" | "east" | "west";

/** Door request: a gap in one wall, offset along it from the wall center. */
export interface DoorSpec {
  side: WallSide;
  offset?: number;
  width?: number;
}

export interface ResolvedDoor {
  side: WallSide;
  /** Door center on the wall plane. */
  center: [x: number, z: number];
  width: number;
}

export interface RoomDef {
  id: RoomId;
  name: string;
  /** Inner footprint, centered on `center`. */
  width: number; // X extent
  depth: number; // Z extent
  height: number;
  center: [x: number, z: number];
  wallThickness: number;
  /** Per-room palette so each era reads differently. */
  wallColor: string;
  floorColor: string;
  ceilingColor: string;
  /** Wall segments (door gaps already cut out). */
  walls: AABB[];
  /** Boxes above door gaps, from DOOR_HEIGHT up to the ceiling. Render only. */
  lintels: AABB[];
  doors: ResolvedDoor[];
  obstacles: Obstacle[];
  /** Everything the player collides with: wall segments + obstacles. */
  colliders: AABB[];
  /** Where teleporting into this room lands you (absolute), + facing yaw. */
  spawn: [x: number, z: number];
  spawnYaw: number;
  /** Sculpture stands (absolute XZ); pedestal boxes derive from these. */
  pedestals?: [x: number, z: number][];
}

export const DOOR_HEIGHT = 2.2;
const DEFAULT_DOOR_WIDTH = 2.4;
const PEDESTAL_SIZE = 0.7;
export const PEDESTAL_HEIGHT = 1.0;

interface WallRun {
  side: WallSide;
  axis: "x" | "z";
  /** Range along the wall axis. */
  from: number;
  to: number;
  /** Range across the wall (thickness). */
  crossMin: number;
  crossMax: number;
}

function wallRuns(
  cx: number,
  cz: number,
  width: number,
  depth: number,
  t: number,
): WallRun[] {
  const hw = width / 2;
  const hd = depth / 2;
  return [
    { side: "north", axis: "x", from: cx - hw - t, to: cx + hw + t, crossMin: cz - hd - t, crossMax: cz - hd },
    { side: "south", axis: "x", from: cx - hw - t, to: cx + hw + t, crossMin: cz + hd, crossMax: cz + hd + t },
    { side: "west", axis: "z", from: cz - hd, to: cz + hd, crossMin: cx - hw - t, crossMax: cx - hw },
    { side: "east", axis: "z", from: cz - hd, to: cz + hd, crossMin: cx + hw, crossMax: cx + hw + t },
  ];
}

function runToAABB(run: WallRun, from: number, to: number): AABB {
  return run.axis === "x"
    ? { minX: from, maxX: to, minZ: run.crossMin, maxZ: run.crossMax }
    : { minX: run.crossMin, maxX: run.crossMax, minZ: from, maxZ: to };
}

interface RoomInput {
  id: RoomId;
  name: string;
  width: number;
  depth: number;
  height: number;
  center: [number, number];
  wallColor: string;
  floorColor: string;
  ceilingColor?: string;
  doors?: DoorSpec[];
  obstacles?: Obstacle[];
  spawn: [number, number];
  spawnYaw?: number;
  pedestals?: [number, number][];
}

function makeRoom(input: RoomInput): RoomDef {
  const t = 0.3;
  const [cx, cz] = input.center;
  const walls: AABB[] = [];
  const lintels: AABB[] = [];
  const doors: ResolvedDoor[] = [];

  for (const run of wallRuns(cx, cz, input.width, input.depth, t)) {
    const wallCenter = run.axis === "x" ? cx : cz;
    const gaps = (input.doors ?? [])
      .filter((d) => d.side === run.side)
      .map((d) => {
        const width = d.width ?? DEFAULT_DOOR_WIDTH;
        const at = wallCenter + (d.offset ?? 0);
        const cross = (run.crossMin + run.crossMax) / 2;
        doors.push({
          side: run.side,
          center: run.axis === "x" ? [at, cross] : [cross, at],
          width,
        });
        return { from: at - width / 2, to: at + width / 2 };
      })
      .sort((a, b) => a.from - b.from);

    let cursor = run.from;
    for (const gap of gaps) {
      if (gap.from > cursor) walls.push(runToAABB(run, cursor, gap.from));
      lintels.push(runToAABB(run, gap.from, gap.to));
      cursor = gap.to;
    }
    if (cursor < run.to) walls.push(runToAABB(run, cursor, run.to));
  }

  const obstacles = [...(input.obstacles ?? [])];
  for (const [px, pz] of input.pedestals ?? []) {
    const h = PEDESTAL_SIZE / 2;
    obstacles.push({
      aabb: { minX: px - h, maxX: px + h, minZ: pz - h, maxZ: pz + h },
      height: PEDESTAL_HEIGHT,
      color: "#8f8779",
    });
  }

  return {
    ...input,
    wallThickness: t,
    ceilingColor: input.ceilingColor ?? "#d8d2c8",
    spawnYaw: input.spawnYaw ?? Math.PI,
    walls,
    lintels,
    doors,
    obstacles,
    colliders: [...walls, ...obstacles.map((o) => o.aabb)],
  };
}

const bench = (x: number, z: number): Obstacle => ({
  aabb: { minX: x - 1, maxX: x + 1, minZ: z - 0.4, maxZ: z + 0.4 },
  height: 0.45,
  color: "#4a3a2c",
});

/**
 * Floor plan: a 30×20 lobby with two era rooms north, two south, and one
 * narrow wing east and west. Doors line up through both walls (each ~0.6m
 * deep opening). All coordinates are absolute world XZ.
 *
 *        [Renaissance]   [Baroque]
 *              |             |
 *   [Sculpture]—  L o b b y  —[Modern]
 *              |             |
 *        [Romanticism] [Impressionism]
 */
export const lobby: RoomDef = makeRoom({
  id: "lobby",
  name: "Atrium",
  width: 30,
  depth: 20,
  height: 6,
  center: [0, 0],
  wallColor: "#b8aa92",
  floorColor: "#6e5c45",
  ceilingColor: "#e2dccf",
  spawn: [0, 6],
  doors: [
    { side: "north", offset: -8 },
    { side: "north", offset: 8 },
    { side: "south", offset: -8 },
    { side: "south", offset: 8 },
    { side: "east", offset: 0 },
    { side: "west", offset: 0 },
  ],
  obstacles: [bench(-4, 0), bench(4, 0)],
});

export const renaissanceRoom: RoomDef = makeRoom({
  id: "renaissance",
  name: "Renaissance Hall",
  width: 26,
  depth: 16,
  height: 5,
  center: [-14, -18],
  wallColor: "#7d2e2a", // deep venetian red
  floorColor: "#564434",
  spawn: [-8, -12],
  spawnYaw: Math.PI,
  doors: [{ side: "south", offset: 6 }],
  obstacles: [bench(-14, -18)],
});

export const baroqueRoom: RoomDef = makeRoom({
  id: "baroque",
  name: "Baroque & Dutch Golden Age",
  width: 26,
  depth: 16,
  height: 5,
  center: [14, -18],
  wallColor: "#3a4434", // dark gallery green
  floorColor: "#4e3e30",
  spawn: [8, -12],
  spawnYaw: Math.PI,
  doors: [{ side: "south", offset: -6 }],
  obstacles: [bench(14, -18)],
});

export const romanticismRoom: RoomDef = makeRoom({
  id: "romanticism",
  name: "Romanticism & Realism",
  width: 26,
  depth: 16,
  height: 5,
  center: [-14, 18],
  wallColor: "#39465c", // stormy blue
  floorColor: "#56473a",
  spawn: [-8, 12],
  spawnYaw: 0,
  doors: [{ side: "north", offset: 6 }],
  obstacles: [bench(-14, 18)],
});

export const impressionismRoom: RoomDef = makeRoom({
  id: "impressionism",
  name: "Impressionism & Post-Impressionism",
  width: 26,
  depth: 16,
  height: 5,
  center: [14, 18],
  wallColor: "#9aa78c", // soft sage
  floorColor: "#5c4a38",
  spawn: [8, 12],
  spawnYaw: 0,
  doors: [{ side: "north", offset: -6 }],
  obstacles: [bench(14, 18)],
});

export const modernRoom: RoomDef = makeRoom({
  id: "modern",
  name: "Modern Wing",
  width: 16,
  depth: 20,
  height: 5,
  center: [23, 0],
  wallColor: "#d6d2c9", // white-cube gallery
  floorColor: "#7a756c",
  spawn: [19, 0],
  spawnYaw: -Math.PI / 2,
  doors: [{ side: "west", offset: 0 }],
  obstacles: [bench(23, 0)],
});

export const sculptureRoom: RoomDef = makeRoom({
  id: "sculpture",
  name: "Sculpture Court",
  width: 16,
  depth: 20,
  height: 6,
  center: [-23, 0],
  wallColor: "#a9a294", // warm stone
  floorColor: "#8c8578",
  ceilingColor: "#e8e3d8",
  spawn: [-19, 0],
  spawnYaw: Math.PI / 2,
  doors: [{ side: "east", offset: 0 }],
  pedestals: [
    [-27, -8], [-27, -5.5], [-27, -3], [-27, -0.5], [-27, 2], [-27, 4.5], [-27, 7],
    [-19, -8], [-19, -5.5], [-19, -3], [-19, 2], [-19, 4.5], [-19, 7],
    [-23, 8.5],
  ],
});

export const allRooms: RoomDef[] = [
  lobby,
  renaissanceRoom,
  baroqueRoom,
  romanticismRoom,
  impressionismRoom,
  modernRoom,
  sculptureRoom,
];

export const roomById = new Map(allRooms.map((r) => [r.id, r]));

/** Static collision world: every wall segment and obstacle in the museum. */
export const allColliders: AABB[] = allRooms.flatMap((r) => r.colliders);

/** Which room footprint contains the point (lobby last as the fallback). */
export function roomAt(x: number, z: number): RoomDef | undefined {
  for (const room of allRooms) {
    if (room.id === "lobby") continue;
    const [cx, cz] = room.center;
    if (
      Math.abs(x - cx) <= room.width / 2 &&
      Math.abs(z - cz) <= room.depth / 2
    ) {
      return room;
    }
  }
  const [cx, cz] = lobby.center;
  if (
    Math.abs(x - cx) <= lobby.width / 2 &&
    Math.abs(z - cz) <= lobby.depth / 2
  ) {
    return lobby;
  }
  return undefined;
}
