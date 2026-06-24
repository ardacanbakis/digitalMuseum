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
  /** Where the caption + controls sit relative to the image. */
  tourCaptionSide: "bottom" | "left" | "right";
  /** Set the slideshow contents (caller flips viewMode to "tour"). */
  startTour: (ids: string[], label: string) => void;
  setTourDurationMs: (ms: number) => void;
  setTourAutoHide: (v: boolean) => void;
  setTourFontScale: (v: number) => void;
  cycleTourCaptionSide: () => void;
}

const SIDES = ["bottom", "left", "right"] as const;

export const createTourSlice: StateCreator<TourSlice, [], [], TourSlice> = (
  set,
) => ({
  tourIds: [],
  tourLabel: "",
  tourDurationMs: 15000,
  tourAutoHide: false,
  tourFontScale: 1,
  tourCaptionSide: "bottom",
  startTour: (ids, label) => set({ tourIds: ids, tourLabel: label }),
  setTourDurationMs: (ms) => set({ tourDurationMs: ms }),
  setTourAutoHide: (v) => set({ tourAutoHide: v }),
  setTourFontScale: (v) =>
    set({ tourFontScale: Math.min(1.8, Math.max(0.7, v)) }),
  cycleTourCaptionSide: () =>
    set((s) => ({
      tourCaptionSide:
        SIDES[(SIDES.indexOf(s.tourCaptionSide) + 1) % SIDES.length],
    })),
});
