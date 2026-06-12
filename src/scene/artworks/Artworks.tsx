import { useMemo } from "react";
import { entriesForRoom } from "../../data/manifest";
import { useStore } from "../../store";
import type { RoomDef } from "../rooms/roomDefs";
import { getRoomPlacements } from "./layout";
import { Painting } from "./Painting";
import { Sculpture } from "./Sculpture";

export function Artworks({ room }: { room: RoomDef }) {
  const placements = useMemo(() => getRoomPlacements(room), [room]);
  const entries = useMemo(() => entriesForRoom(room.id), [room.id]);
  const active = useStore((s) => s.activeRooms.includes(room.id));

  // Distant rooms render bare walls only — no artwork meshes, no textures
  if (!active) return null;

  return (
    <group>
      {entries.map((entry) => {
        const placement = placements.get(entry.wikidataId);
        if (!placement) return null;
        const Component = entry.type === "sculpture" ? Sculpture : Painting;
        return (
          <Component
            key={entry.wikidataId}
            entry={entry}
            placement={placement}
            active={active}
          />
        );
      })}
    </group>
  );
}
