import { allRooms } from "../scene/rooms/roomDefs";
import { isTouchDevice } from "../scene/player/input";
import { requestLock } from "../scene/player/usePointerLock";
import { useStore } from "../store";
import styles from "./MapOverlay.module.css";

// World → SVG: the museum spans roughly x ∈ [-31.5, 31.5], z ∈ [-26.5, 26.5]
const VIEW = { x: -32, z: -27.5, w: 64, h: 55 };

/**
 * Floor-plan overlay (M): shows every room, the player marker, and
 * teleports on room click.
 */
export function MapOverlay() {
  const open = useStore((s) => s.viewMode === "map");
  const currentRoom = useStore((s) => s.currentRoom);
  const playerPos = useStore((s) => s.playerPos);

  if (!open) return null;

  const close = () => {
    useStore.getState().setViewMode("walking");
    if (!isTouchDevice()) requestLock();
  };

  const teleport = (roomId: string) => {
    const room = allRooms.find((r) => r.id === roomId);
    if (!room) return;
    useStore.getState().requestTeleport({
      x: room.spawn[0],
      z: room.spawn[1],
      yaw: room.spawnYaw,
    });
    close();
  };

  return (
    <div className={styles.backdrop} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.heading}>Museum Map</h2>
        <p className={styles.sub}>Click a room to walk straight there</p>
        <svg
          className={styles.map}
          viewBox={`${VIEW.x} ${VIEW.z} ${VIEW.w} ${VIEW.h}`}
        >
          {allRooms.map((room) => {
            const [cx, cz] = room.center;
            return (
              <g
                key={room.id}
                className={styles.room}
                data-current={room.id === currentRoom}
                onClick={() => teleport(room.id)}
              >
                <rect
                  x={cx - room.width / 2}
                  y={cz - room.depth / 2}
                  width={room.width}
                  height={room.depth}
                  rx={0.6}
                  fill={room.wallColor}
                />
                <text x={cx} y={cz} className={styles.roomLabel}>
                  {room.id === "lobby" ? "Atrium" : room.name.split(" &")[0]}
                </text>
              </g>
            );
          })}
          {/* doorways */}
          {allRooms.flatMap((room) =>
            room.doors.map((door, i) => (
              <circle
                key={`${room.id}-door-${i}`}
                cx={door.center[0]}
                cy={door.center[1]}
                r={0.9}
                className={styles.door}
              />
            )),
          )}
          <circle
            cx={playerPos[0]}
            cy={playerPos[1]}
            r={1.1}
            className={styles.player}
          />
        </svg>
        <p className={styles.hint}>M or ESC to close</p>
      </div>
    </div>
  );
}
