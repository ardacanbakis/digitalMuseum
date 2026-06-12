import { Lighting } from "./Lighting";
import { GrayBoxRoom } from "./rooms/GrayBoxRoom";
import { grayBoxRoom } from "./rooms/roomDefs";
import { Player } from "./player/Player";

export function Scene() {
  return (
    <>
      <Lighting />
      <GrayBoxRoom room={grayBoxRoom} />
      <Player room={grayBoxRoom} />
    </>
  );
}
