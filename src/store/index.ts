import { create } from "zustand";
import { createAppSlice, type AppSlice } from "./appSlice";
import { createArtworkSlice, type ArtworkSlice } from "./artworkSlice";

// Phase 5 adds musicSlice — composed here.
export type StoreState = AppSlice & ArtworkSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAppSlice(...a),
  ...createArtworkSlice(...a),
}));
