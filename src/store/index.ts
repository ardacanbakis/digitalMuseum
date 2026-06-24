import { create } from "zustand";
import { createAppSlice, type AppSlice } from "./appSlice";
import { createArtworkSlice, type ArtworkSlice } from "./artworkSlice";
import { createMusicSlice, type MusicSlice } from "./musicSlice";
import { createTourSlice, type TourSlice } from "./tourSlice";

export type StoreState = AppSlice & ArtworkSlice & MusicSlice & TourSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAppSlice(...a),
  ...createArtworkSlice(...a),
  ...createMusicSlice(...a),
  ...createTourSlice(...a),
}));
