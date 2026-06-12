import { create } from "zustand";
import { createAppSlice, type AppSlice } from "./appSlice";

// Phase 2 adds artworkSlice, Phase 5 adds musicSlice — composed here.
export type StoreState = AppSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAppSlice(...a),
}));
