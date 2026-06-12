import type { AABB, RoomDef } from "./roomDefs";

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

export function GrayBoxRoom({ room }: { room: RoomDef }) {
  const [cx, cz] = room.center;
  const wallCount = 4; // first 4 colliders are the perimeter walls
  const walls = room.colliders.slice(0, wallCount);

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0, cz]}>
        <planeGeometry
          args={[
            room.width + room.wallThickness * 2,
            room.depth + room.wallThickness * 2,
          ]}
        />
        <meshStandardMaterial color="#4a423a" />
      </mesh>

      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position={[cx, room.height, cz]}>
        <planeGeometry
          args={[
            room.width + room.wallThickness * 2,
            room.depth + room.wallThickness * 2,
          ]}
        />
        <meshStandardMaterial color="#39322b" />
      </mesh>

      {walls.map((aabb, i) => {
        const { position, size } = boxFromAABB(aabb, room.height);
        return (
          <mesh key={`wall-${i}`} position={position}>
            <boxGeometry args={size} />
            <meshStandardMaterial color="#6e655a" />
          </mesh>
        );
      })}

      {/* colored reference boxes so motion is perceptible */}
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
