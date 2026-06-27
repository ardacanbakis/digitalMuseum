import { useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { closeInspect } from "../artworks/interaction";
import { useStore } from "../../store";
import { ceilingTexture, floorTexture, wallTexture } from "../textures";
import { DOOR_HEIGHT, type AABB, type RoomDef } from "./roomDefs";

/** Floors with a polished sheen vs matte get different roughness. */
const FLOOR_ROUGHNESS: Record<string, number> = {
  marble: 0.45,
  checker: 0.4,
  travertine: 0.6,
  wood: 0.7,
  concrete: 0.85,
};

function boxFromAABB(aabb: AABB, height: number, y = height / 2) {
  return {
    position: [
      (aabb.minX + aabb.maxX) / 2,
      y,
      (aabb.minZ + aabb.maxZ) / 2,
    ] as [number, number, number],
    size: [aabb.maxX - aabb.minX, height, aabb.maxZ - aabb.minZ] as [
      number,
      number,
      number,
    ],
  };
}

export function RoomShell({ room }: { room: RoomDef }) {
  const [cx, cz] = room.center;

  const { floorMat, wallMat, ceilMat } = useMemo(() => {
    const floorTex = floorTexture(room.floorStyle, room.floorColor);
    floorTex.repeat.set(room.width / 4, room.depth / 4);
    const wallTex = wallTexture(room.wallColor);
    wallTex.repeat.set(3, 2);
    const ceilTex = ceilingTexture(room.ceilingColor);
    ceilTex.repeat.set(room.width / 6, room.depth / 6);
    return {
      floorMat: new MeshStandardMaterial({
        map: floorTex,
        roughness: FLOOR_ROUGHNESS[room.floorStyle] ?? 0.7,
        metalness: 0,
      }),
      wallMat: new MeshStandardMaterial({
        map: wallTex,
        roughness: 0.92,
        metalness: 0,
      }),
      ceilMat: new MeshStandardMaterial({
        map: ceilTex,
        roughness: 0.95,
        metalness: 0,
      }),
    };
  }, [room]);

  return (
    <group
      onClick={(e) => {
        // Clicking anywhere on the room (not a painting) while inspecting
        // puts the painting back; paintings stopPropagation so this never
        // fires for clicks on them. Drag-pans (large pointer travel)
        // don't count as clicks.
        if (
          e.delta <= 5 &&
          !document.pointerLockElement &&
          useStore.getState().viewMode === "inspecting"
        ) {
          closeInspect();
        }
      }}
    >
      {/* floor — sized to the footprint so adjacent rooms meet edge-to-edge
          at shared boundaries instead of overlapping (which z-fought and
          flickered in the doorways) */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[cx, 0, cz]}
        material={floorMat}
      >
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>

      {/* ceiling */}
      <mesh
        rotation-x={Math.PI / 2}
        position={[cx, room.height, cz]}
        material={ceilMat}
      >
        <planeGeometry args={[room.width, room.depth]} />
      </mesh>

      {room.walls.map((aabb, i) => {
        const { position, size } = boxFromAABB(aabb, room.height);
        return (
          <mesh key={`wall-${i}`} position={position} material={wallMat}>
            <boxGeometry args={size} />
          </mesh>
        );
      })}

      {/* lintels above door openings */}
      {room.lintels.map((aabb, i) => {
        const h = room.height - DOOR_HEIGHT;
        const { position, size } = boxFromAABB(aabb, h, DOOR_HEIGHT + h / 2);
        return (
          <mesh
            key={`lintel-${i}`}
            position={position}
            material={wallMat}
          >
            <boxGeometry args={size} />
          </mesh>
        );
      })}

      {/* benches, pedestals and other solid props */}
      {room.obstacles.map((o, i) => {
        const { position, size } = boxFromAABB(o.aabb, o.height);
        return (
          <mesh key={`obstacle-${i}`} position={position}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={o.color} />
          </mesh>
        );
      })}
    </group>
  );
}
