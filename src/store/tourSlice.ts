import type { StateCreator } from "zustand";

export interface TourSlice {
  /** Artwork ids for the running slideshow. */
  tourIds: string[];
  /** Label of the active set, e.g. "Highlights" / "Vincent van Gogh". */
  tourLabel: string;
  /** Per-slide duration (ms). 9s–60s, default 15s. */
  tourDurationMs: number;
  /** Auto-hide captions/controls after a few seconds of no interaction. */
  tourAutoHide: boolean;
  /** Caption text scale multiplier. */
  tourFontScale: number;
  /** Set the slideshow contents (caller flips viewMode to "tour"). */
  startTour: (ids: string[], label: string) => void;
  setTourDurationMs: (ms: number) => void;
  setTourAutoHide: (v: boolean) => void;
  setTourFontScale: (v: number) => void;
}

export const createTourSlice: StateCreator<TourSlice, [], [], TourSlice> = (
  set,
) => ({
  tourIds: [],
  tourLabel: "",
  tourDurationMs: 15000,
  tourAutoHide: false,
  tourFontScale: 1,
  startTour: (ids, label) => set({ tourIds: ids, tourLabel: label }),
  setTourDurationMs: (ms) => set({ tourDurationMs: ms }),
  setTourAutoHide: (v) => set({ tourAutoHide: v }),
  setTourFontScale: (v) =>
    set({ tourFontScale: Math.min(1.8, Math.max(0.7, v)) }),
});
