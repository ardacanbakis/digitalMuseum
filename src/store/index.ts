import { create } from "zustand";
import { createAppSlice, type AppSlice } from "./appSlice";
import { createArtworkSlice, type ArtworkSlice } from "./artworkSlice";
import { createMusicSlice, type MusicSlice } from "./musicSlice";

export type StoreState = AppSlice & ArtworkSlice & MusicSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAppSlice(...a),
  ...createArtworkSlice(...a),
  ...createMusicSlice(...a),
}));
