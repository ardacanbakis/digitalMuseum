import { useEffect } from "react";
import { loadRoomArtworks } from "../api/loadArtworks";
import { Artworks } from "./artworks/Artworks";
import { InteractionManager } from "./artworks/InteractionManager";
import { Lighting } from "./Lighting";
import { Player } from "./player/Player";
import { impressionismRoom } from "./rooms/roomDefs";
import { RoomShell } from "./rooms/RoomShell";

export function Scene() {
  // Proximity-based per-room loading arrives with the Phase 4 floor plan;
  // for the single hall, load on mount.
  useEffect(() => {
    void loadRoomArtworks(impressionismRoom.id);
  }, []);

  return (
    <>
      <Lighting />
      <RoomShell room={impressionismRoom} />
      <Artworks room={impressionismRoom} />
      <InteractionManager />
      <Player room={impressionismRoom} />
    </>
  );
}
