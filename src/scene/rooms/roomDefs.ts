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
  id: string;
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

/** Phase 1 gray-box room. Real gallery rooms replace this in Phase 4. */
export const grayBoxRoom: RoomDef = makeRoom({
  id: "graybox",
  name: "Gray Box",
  width: 12,
  depth: 8,
  height: 4,
  center: [0, 0],
  wallThickness: 0.3,
  spawn: [0, 2.5],
  obstacles: [
    {
      aabb: { minX: -3.5, maxX: -2.5, minZ: -1.5, maxZ: -0.5 },
      height: 1.1,
      color: "#b0413e",
    },
    {
      aabb: { minX: 2.6, maxX: 3.4, minZ: -2.2, maxZ: -1.4 },
      height: 1.4,
      color: "#3e6990",
    },
    {
      aabb: { minX: 0.4, maxX: 1.6, minZ: 1.2, maxZ: 1.8 },
      height: 0.5,
      color: "#7a8c4f",
    },
  ],
});
