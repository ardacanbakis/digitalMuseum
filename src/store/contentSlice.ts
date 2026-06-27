import type { StateCreator } from "zustand";
import type { Supporter } from "../api/supporters";

const ADMIN_KEY_STORE = "dm:adminKey";

function initialAdminKey(): string {
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORE) ?? "";
  } catch {
    return "";
  }
}

export interface ContentSlice {
  /** Reactive supporters list (3D frame + panels read this). */
  supporters: Supporter[];
  /** Admin passphrase, kept for the session only. */
  adminKey: string;
  setSupporters: (s: Supporter[]) => void;
  setAdminKey: (key: string) => void;
}

export const createContentSlice: StateCreator<ContentSlice, [], [], ContentSlice> = (
  set,
) => ({
  supporters: [],
  adminKey: initialAdminKey(),
  setSupporters: (s) => set({ supporters: s }),
  setAdminKey: (key) => {
    try {
      sessionStorage.setItem(ADMIN_KEY_STORE, key);
    } catch {
      // ignore
    }
    set({ adminKey: key });
  },
});
