import type { StateCreator } from "zustand";
import type { FetchedArtwork } from "../data/types";

export type ArtworkStatus = "loading" | "loaded" | "error";

export interface ArtworkRecord {
  status: ArtworkStatus;
  data?: FetchedArtwork;
  error?: string;
}

export interface ArtworkSlice {
  artworkData: Record<string, ArtworkRecord>;
  selectedArtwork: string | null;
  hoveredArtwork: string | null;
  /** Atrium info-frame currently open / under the crosshair. */
  selectedFrame: string | null;
  hoveredFrame: string | null;
  mergeArtworkRecords: (records: Record<string, ArtworkRecord>) => void;
  clearArtworkData: () => void;
  setSelectedArtwork: (wikidataId: string | null) => void;
  setHoveredArtwork: (wikidataId: string | null) => void;
  setSelectedFrame: (frameId: string | null) => void;
  setHoveredFrame: (frameId: string | null) => void;
}

export const createArtworkSlice: StateCreator<ArtworkSlice, [], [], ArtworkSlice> = (
  set,
) => ({
  artworkData: {},
  selectedArtwork: null,
  hoveredArtwork: null,
  selectedFrame: null,
  hoveredFrame: null,
  mergeArtworkRecords: (records) =>
    set((s) => ({ artworkData: { ...s.artworkData, ...records } })),
  clearArtworkData: () => set({ artworkData: {} }),
  setSelectedArtwork: (wikidataId) => set({ selectedArtwork: wikidataId }),
  setHoveredArtwork: (wikidataId) => set({ hoveredArtwork: wikidataId }),
  setSelectedFrame: (frameId) => set({ selectedFrame: frameId }),
  setHoveredFrame: (frameId) => set({ hoveredFrame: frameId }),
});
