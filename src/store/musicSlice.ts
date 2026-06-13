import type { StateCreator } from "zustand";

export interface MusicSlice {
  /** Index into the playlist; -1 before the engine starts. */
  trackIndex: number;
  musicStarted: boolean;
  isPlaying: boolean;
  musicVolume: number; // 0..1 master, before ducking
  muted: boolean;
  setTrackIndex: (i: number) => void;
  setMusicStarted: (v: boolean) => void;
  setIsPlaying: (v: boolean) => void;
  setMusicVolume: (v: number) => void;
  setMuted: (v: boolean) => void;
}

export const createMusicSlice: StateCreator<MusicSlice, [], [], MusicSlice> = (
  set,
) => ({
  trackIndex: -1,
  musicStarted: false,
  isPlaying: false,
  musicVolume: 0.7,
  muted: false,
  setTrackIndex: (i) => set({ trackIndex: i }),
  setMusicStarted: (v) => set({ musicStarted: v }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setMusicVolume: (v) => set({ musicVolume: v }),
  setMuted: (v) => set({ muted: v }),
});
