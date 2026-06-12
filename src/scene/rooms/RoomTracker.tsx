import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { loadRoomArtworks } from "../../api/loadArtworks";
import type { RoomId } from "../../data/types";
import { useStore } from "../../store";
import { allRooms, lobby, roomAt, type RoomDef } from "./roomDefs";

const CHECK_INTERVAL = 0.3; // seconds between room/proximity checks
const PREFETCH_DISTANCE_SQ = 10 * 10; // load a room when this near its door

const loadRequested = new Set<RoomId>();

function requestLoad(roomId: RoomId) {
  // loadRoomArtworks itself skips loaded entries; this just avoids
  // re-dispatching every check while a load is in flight
  if (loadRequested.has(roomId)) return;
  loadRequested.add(roomId);
  void loadRoomArtworks(roomId).finally(() => loadRequested.delete(roomId));
}

function doorDistanceSq(room: RoomDef, x: number, z: number): number {
  let best = Infinity;
  for (const door of room.doors) {
    const dx = door.center[0] - x;
    const dz = door.center[1] - z;
    best = Math.min(best, dx * dx + dz * dz);
  }
  return best;
}

/**
 * Tracks which room the player is in and which rooms are near enough to
 * load + texture ("active"): the current room plus any room whose door is
 * within prefetch range — so textures are arriving before you cross the
 * threshold.
 */
export function RoomTracker() {
  const camera = useThree((s) => s.camera);
  const timer = useRef(CHECK_INTERVAL); // run on first frame

  useFrame((_, delta) => {
    timer.current += delta;
    if (timer.current < CHECK_INTERVAL) return;
    timer.current = 0;

    const { x, z } = camera.position;
    const store = useStore.getState();
    const room = roomAt(x, z) ?? lobby;
    if (room.id !== store.currentRoom) store.setCurrentRoom(room.id);

    const active: RoomId[] = [];
    for (const r of allRooms) {
      if (r.id === "lobby") continue;
      if (r.id === room.id || doorDistanceSq(r, x, z) < PREFETCH_DISTANCE_SQ) {
        active.push(r.id);
        requestLoad(r.id);
      }
    }
    const prev = store.activeRooms;
    if (
      active.length !== prev.length ||
      active.some((id, i) => id !== prev[i])
    ) {
      store.setActiveRooms(active);
    }
  });

  return null;
}
