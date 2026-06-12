import type { AABB } from "../rooms/roomDefs";

export const WALK_SPEED = 2.5; // m/s
export const RUN_SPEED = 4.5; // m/s while Shift is held
export const EYE_HEIGHT = 1.65; // m
export const PLAYER_RADIUS = 0.35; // m

function blocked(x: number, z: number, colliders: AABB[]): boolean {
  for (const c of colliders) {
    if (
      x > c.minX - PLAYER_RADIUS &&
      x < c.maxX + PLAYER_RADIUS &&
      z > c.minZ - PLAYER_RADIUS &&
      z < c.maxZ + PLAYER_RADIUS
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Resolve movement per axis so the player slides along walls instead of
 * sticking. Returns the new XZ position.
 */
export function resolveMovement(
  x: number,
  z: number,
  dx: number,
  dz: number,
  colliders: AABB[],
): [number, number] {
  let nx = x + dx;
  if (blocked(nx, z, colliders)) nx = x;
  let nz = z + dz;
  if (blocked(nx, nz, colliders)) nz = z;
  return [nx, nz];
}
