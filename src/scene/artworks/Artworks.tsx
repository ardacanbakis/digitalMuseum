import { useMemo } from "react";
import { entriesForRoom } from "../../data/manifest";
import type { RoomDef } from "../rooms/roomDefs";
import { getRoomPlacements } from "./layout";
import { Painting } from "./Painting";

export function Artworks({ room }: { room: RoomDef }) {
  const placements = useMemo(() => getRoomPlacements(room), [room]);
  const entries = useMemo(() => entriesForRoom(room.id), [room.id]);

  return (
    <group>
      {entries.map((entry) => {
        const placement = placements.get(entry.wikidataId);
        if (!placement) return null;
        return (
          <Painting
            key={entry.wikidataId}
            entry={entry}
            placement={placement}
          />
        );
      })}
    </group>
  );
}
