import type { StateCreator } from "zustand";

/** "menu" = overlay shown, "walking" = first-person, "inspecting" = artwork focus. */
export type ViewMode = "menu" | "walking" | "inspecting";

export type QualityPreset = "high" | "low";

export interface Settings {
  quality: QualityPreset;
}

export interface AppSlice {
  viewMode: ViewMode;
  currentRoom: string;
  settings: Settings;
  setViewMode: (mode: ViewMode) => void;
  setCurrentRoom: (roomId: string) => void;
  setQuality: (quality: QualityPreset) => void;
}

export const createAppSlice: StateCreator<AppSlice, [], [], AppSlice> = (
  set,
) => ({
  viewMode: "menu",
  currentRoom: "impressionism",
  settings: { quality: "high" },
  setViewMode: (mode) => set({ viewMode: mode }),
  setCurrentRoom: (roomId) => set({ currentRoom: roomId }),
  setQuality: (quality) =>
    set((s) => ({ settings: { ...s.settings, quality } })),
});
