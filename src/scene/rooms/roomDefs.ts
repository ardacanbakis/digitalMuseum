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

export interface RoomDef {
  id: RoomId;
  name: string;
  /** Inner footprint, centered on origin offset. */
  width: number; // X extent
  depth: number; // Z extent
  height: number;
  center: [x: number, z: number];
  wallThickness: number;
  /** All solids the player collides with: perimeter walls + obstacles. */
  colliders: AABB[];
  obstacles: Obstacle[];
  spawn: [x: number, z: number];
}

function perimeterWalls(
  cx: number,
  cz: number,
  width: number,
  depth: number,
  t: number,
): AABB[] {
  const hw = width / 2;
  const hd = depth / 2;
  return [
    // north (-Z) and south (+Z)
    { minX: cx - hw - t, maxX: cx + hw + t, minZ: cz - hd - t, maxZ: cz - hd },
    { minX: cx - hw - t, maxX: cx + hw + t, minZ: cz + hd, maxZ: cz + hd + t },
    // west (-X) and east (+X)
    { minX: cx - hw - t, maxX: cx - hw, minZ: cz - hd, maxZ: cz + hd },
    { minX: cx + hw, maxX: cx + hw + t, minZ: cz - hd, maxZ: cz + hd },
  ];
}

function makeRoom(
  def: Omit<RoomDef, "colliders"> & { colliders?: AABB[] },
): RoomDef {
  const walls = perimeterWalls(
    def.center[0],
    def.center[1],
    def.width,
    def.depth,
    def.wallThickness,
  );
  return {
    ...def,
    colliders: [...walls, ...def.obstacles.map((o) => o.aabb)],
  };
}

/** Impressionism hall, sized so ~32 works hang comfortably. The full
 * multi-room floor plan arrives in Phase 4. */
export const impressionismRoom: RoomDef = makeRoom({
  id: "impressionism",
  name: "Impressionism & Post-Impressionism",
  width: 26,
  depth: 16,
  height: 5,
  center: [0, 0],
  wallThickness: 0.3,
  spawn: [0, 4],
  obstacles: [
    // central visitor benches
    {
      aabb: { minX: -5, maxX: -3, minZ: -0.4, maxZ: 0.4 },
      height: 0.45,
      color: "#4a3a2c",
    },
    {
      aabb: { minX: 3, maxX: 5, minZ: -0.4, maxZ: 0.4 },
      height: 0.45,
      color: "#4a3a2c",
    },
  ],
});
