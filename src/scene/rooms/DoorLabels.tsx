import { Text } from "@react-three/drei";
import { allRooms, DOOR_HEIGHT, type WallSide } from "./roomDefs";

const OUTWARD: Record<WallSide, [number, number]> = {
  north: [0, -1],
  south: [0, 1],
  east: [1, 0],
  west: [-1, 0],
};

function rotationFor(outward: [number, number]): number {
  if (outward[1] === 1) return 0;
  if (outward[1] === -1) return Math.PI;
  return outward[0] === 1 ? Math.PI / 2 : -Math.PI / 2;
}

/** Era name floating above each room's doorway, facing the lobby. */
export function DoorLabels() {
  return (
    <>
      {allRooms
        .filter((room) => room.id !== "lobby")
        .flatMap((room) =>
          room.doors.map((door, i) => {
            const outward = OUTWARD[door.side];
            const [dx, dz] = door.center;
            return (
              <Text
                key={`${room.id}-${i}`}
                position={[
                  dx + outward[0] * 0.5,
                  DOOR_HEIGHT + 0.45,
                  dz + outward[1] * 0.5,
                ]}
                rotation-y={rotationFor(outward)}
                fontSize={0.34}
                maxWidth={6}
                textAlign="center"
                color="#e7dcc8"
                outlineWidth={0.012}
                outlineColor="#1c150e"
                anchorX="center"
                anchorY="middle"
              >
                {room.name}
              </Text>
            );
          }),
        )}
    </>
  );
}
