import type { StateCreator } from "zustand";
import type { Lang } from "../data/i18n";
import type { RoomId } from "../data/types";

const LANG_KEY = "dm:lang";

function initialLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === "tr" ? "tr" : "en";
  } catch {
    return "en";
  }
}

/** "menu" = overlay, "walking" = first-person, "inspecting" = artwork
 * focus, "map" = minimap/teleport overlay, "search" = search palette,
 * "tour" = full-screen guided slideshow, "frame" = atrium info-frame
 * panel (welcome, donators, credits, guest book). */
export type ViewMode =
  | "menu"
  | "walking"
  | "inspecting"
  | "map"
  | "search"
  | "tour"
  | "frame"
  | "admin";

export type QualityPreset = "high" | "low";

export interface Settings {
  quality: QualityPreset;
  language: Lang;
}

export interface TeleportTarget {
  x: number;
  z: number;
  yaw: number;
}

export interface AppSlice {
  viewMode: ViewMode;
  currentRoom: RoomId;
  /** Rooms close enough to render artwork textures for. */
  activeRooms: RoomId[];
  /** Player XZ, throttled — drives the minimap marker. */
  playerPos: [number, number];
  teleportTarget: TeleportTarget | null;
  settings: Settings;
  setViewMode: (mode: ViewMode) => void;
  setCurrentRoom: (roomId: RoomId) => void;
  setActiveRooms: (rooms: RoomId[]) => void;
  setPlayerPos: (x: number, z: number) => void;
  requestTeleport: (target: TeleportTarget) => void;
  clearTeleport: () => void;
  setQuality: (quality: QualityPreset) => void;
  setLanguage: (language: Lang) => void;
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (
  set,
) => ({
  viewMode: "menu",
  currentRoom: "lobby",
  activeRooms: ["lobby"],
  playerPos: [0, 6],
  teleportTarget: null,
  settings: { quality: "high", language: initialLang() },
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentRoom: (roomId) => set({ currentRoom: roomId }),
  setActiveRooms: (rooms) => set({ activeRooms: rooms }),
  setPlayerPos: (x, z) => set({ playerPos: [x, z] }),
  requestTeleport: (target) => set({ teleportTarget: target }),
  clearTeleport: () => set({ teleportTarget: null }),
  setQuality: (quality) =>
    set((s) => ({ settings: { ...s.settings, quality } })),
  setLanguage: (language) => {
    try {
      localStorage.setItem(LANG_KEY, language);
    } catch {
      // ignore
    }
    set((s) => ({ settings: { ...s.settings, language } }));
  },
});
