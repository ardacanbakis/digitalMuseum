import { Artworks } from "./artworks/Artworks";
import { InteractionManager } from "./artworks/InteractionManager";
import { Lighting } from "./Lighting";
import { Player } from "./player/Player";
import { Props } from "./Props";
import { allRooms } from "./rooms/roomDefs";
import { InfoFrames } from "./lobby/InfoFrames";
import { DoorLabels } from "./rooms/DoorLabels";
import { RoomShell } from "./rooms/RoomShell";
import { RoomTracker } from "./rooms/RoomTracker";

export function Scene() {
  return (
    <>
      <Lighting />
      {allRooms.map((room) => (
        <RoomShell key={room.id} room={room} />
      ))}
      {allRooms
        .filter((room) => room.id !== "lobby")
        .map((room) => (
          <Artworks key={room.id} room={room} />
        ))}
      <DoorLabels />
      <InfoFrames />
      <Props />
      <RoomTracker />
      <InteractionManager />
      <Player />
    </>
  );
}
