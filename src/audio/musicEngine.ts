import { playlist, trackUrl } from "../data/playlist";
import { useStore } from "../store";

/**
 * Singleton audio engine: two <audio> elements crossfaded (~2s) for
 * gapless track changes, volume ducking while an artwork info panel is
 * open, shuffle order per session, and skip-on-error. All UI state lives
 * in the zustand musicSlice; this module owns the elements and timers.
 */

const FADE_S = 2;
const DUCK_LEVEL = 0.35; // volume multiplier while inspecting
const TICK_MS = 80;

interface Deck {
  el: HTMLAudioElement;
  /** 0..1 crossfade gain. */
  gain: number;
}

let decks: [Deck, Deck] | null = null;
let activeIdx = 0;
let order: number[] = [];
let orderPos = 0;
let duck = 1;
let failures = 0;
let timer: number | null = null;

function shuffle(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function applyVolumes() {
  if (!decks) return;
  const s = useStore.getState();
  const master = s.muted ? 0 : s.musicVolume;
  for (const deck of decks) {
    deck.el.volume = Math.min(1, Math.max(0, master * duck * deck.gain));
  }
}

function ensureDecks(): [Deck, Deck] {
  if (decks) return decks;
  const make = (): Deck => {
    const el = new Audio();
    el.preload = "auto";
    el.addEventListener("error", () => {
      // Bad/missing file: skip ahead, but never loop forever
      if (++failures <= playlist.length) nextTrack();
    });
    return { el, gain: 0 };
  };
  decks = [make(), make()];

  // Duck while an artwork is being inspected
  useStore.subscribe((s) => {
    const target = s.viewMode === "inspecting" ? DUCK_LEVEL : 1;
    if (target !== duckTarget) duckTarget = target;
  });
  return decks;
}

let duckTarget = 1;

function tick() {
  if (!decks) return;
  const active = decks[activeIdx];
  const other = decks[1 - activeIdx];

  // Smooth duck toward target
  duck += (duckTarget - duck) * 0.15;
  if (Math.abs(duck - duckTarget) < 0.01) duck = duckTarget;

  const step = TICK_MS / 1000 / FADE_S;
  if (other.gain > 0 || !other.el.paused) {
    // Crossfading: ramp the newcomer in, the old deck out
    other.gain = Math.min(1, other.gain + step);
    active.gain = Math.max(0, active.gain - step);
    if (other.gain >= 1) {
      active.el.pause();
      active.gain = 0;
      other.gain = 1;
      activeIdx = 1 - activeIdx;
    }
  } else if (
    !active.el.paused &&
    Number.isFinite(active.el.duration) &&
    active.el.duration - active.el.currentTime < FADE_S + 0.2
  ) {
    // Approaching the end of the track: start the next one
    nextTrack();
  }
  applyVolumes();
}

function startTimer() {
  if (timer === null) timer = window.setInterval(tick, TICK_MS);
}

function loadInto(deck: Deck, playlistIndex: number, play: boolean) {
  const track = playlist[playlistIndex];
  if (!track) return;
  deck.el.src = trackUrl(track);
  const store = useStore.getState();
  store.setTrackIndex(playlistIndex);
  // Surface the new track briefly in the player UI
  store.setPlayerExpanded(true);
  if (play) {
    void deck.el.play().catch(() => {
      // Autoplay refused (no gesture yet) — stay paused
      useStore.getState().setIsPlaying(false);
    });
  }
}

/** Called from the entry screen (a user gesture). */
export function startMusic(withSound: boolean): void {
  if (playlist.length === 0) return;
  const store = useStore.getState();
  if (store.musicStarted) return;
  const d = ensureDecks();
  order = shuffle(playlist.length);
  orderPos = 0;
  store.setMusicStarted(true);
  store.setMuted(!withSound);
  d[activeIdx].gain = 1;
  loadInto(d[activeIdx], order[0], withSound);
  store.setIsPlaying(withSound);
  startTimer();
  applyVolumes();
}

function changeTrack(direction: 1 | -1) {
  if (!decks || order.length === 0) return;
  orderPos = (orderPos + direction + order.length) % order.length;
  const playing = useStore.getState().isPlaying;
  if (playing) {
    // Crossfade into the other deck
    const other = decks[1 - activeIdx];
    other.gain = Math.max(other.gain, 0.001);
    loadInto(other, order[orderPos], true);
  } else {
    loadInto(decks[activeIdx], order[orderPos], false);
  }
}

export function nextTrack(): void {
  changeTrack(1);
}

export function prevTrack(): void {
  changeTrack(-1);
}

export function togglePlay(): void {
  const store = useStore.getState();
  if (!store.musicStarted) {
    // First P press doubles as "start the music"
    startMusic(true);
    store.setMuted(false);
    return;
  }
  if (!decks) return;
  const active = decks[activeIdx];
  if (store.isPlaying) {
    active.el.pause();
    decks[1 - activeIdx].el.pause();
    store.setIsPlaying(false);
  } else {
    if (store.muted) store.setMuted(false);
    void active.el.play().catch(() => undefined);
    store.setIsPlaying(true);
    applyVolumes();
  }
}

export function setMusicVolume(v: number): void {
  useStore.getState().setMusicVolume(v);
  applyVolumes();
}

export function toggleMute(): void {
  const store = useStore.getState();
  store.setMuted(!store.muted);
  applyVolumes();
}
