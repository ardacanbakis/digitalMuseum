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
  mergeArtworkRecords: (records: Record<string, ArtworkRecord>) => void;
  setSelectedArtwork: (wikidataId: string | null) => void;
}

export const createArtworkSlice: StateCreator<ArtworkSlice, [], [], ArtworkSlice> = (
  set,
) => ({
  artworkData: {},
  selectedArtwork: null,
  mergeArtworkRecords: (records) =>
    set((s) => ({ artworkData: { ...s.artworkData, ...records } })),
  setSelectedArtwork: (wikidataId) => set({ selectedArtwork: wikidataId }),
});
