import { startMusic } from "../audio/musicEngine";
import { loadIdsData, type Group } from "../data/collection";
import { useStore } from "../store";

/** Start the slideshow for a group: load its data, music on, tour mode. */
export function launchTour(group: Group): void {
  if (group.ids.length === 0) return;
  const store = useStore.getState();
  store.startTour(group.ids, group.label);
  loadIdsData(group.ids);
  startMusic(true);
  store.setViewMode("tour");
}
