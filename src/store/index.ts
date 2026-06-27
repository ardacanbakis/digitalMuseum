import { create } from "zustand";
import { createAppSlice, type AppSlice } from "./appSlice";
import { createArtworkSlice, type ArtworkSlice } from "./artworkSlice";
import { createContentSlice, type ContentSlice } from "./contentSlice";
import { createMusicSlice, type MusicSlice } from "./musicSlice";
import { createTourSlice, type TourSlice } from "./tourSlice";

export type StoreState = AppSlice &
  ArtworkSlice &
  MusicSlice &
  TourSlice &
  ContentSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAppSlice(...a),
  ...createArtworkSlice(...a),
  ...createMusicSlice(...a),
  ...createTourSlice(...a),
  ...createContentSlice(...a),
}));
