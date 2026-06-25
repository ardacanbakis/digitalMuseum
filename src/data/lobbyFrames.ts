/**
 * Atrium info-frame content. EDIT THIS FILE to update the museum's
 * welcome text, supporters, and credits — it's plain data, no code.
 *
 * Each frame hangs on an atrium wall; walking up and clicking it opens a
 * 2D panel. Positions are absolute world XZ; rotationY faces into the room
 * (0 = +Z / north wall, π = south, π/2 = west, -π/2 = east).
 */

export type FrameKind = "welcome" | "donators" | "credits" | "guestbook";

export interface FrameDef {
  id: string;
  kind: FrameKind;
  title: string;
  /** Wall placement. */
  position: [x: number, y: number, z: number];
  rotationY: number;
  width: number;
  height: number;
}

/** ── Welcome / instructions text (shown in the welcome frame panel) ── */
export const WELCOME = {
  heading: "Welcome to the Digital Museum",
  paragraphs: [
    "Wander freely through eight halls of canonical art, from the Renaissance to the modern era. Every painting and fact is pulled live from Wikipedia, Wikidata and Wikimedia Commons — nothing is bundled with the app.",
    "Walk with W A S D (or the arrows), look with the mouse, and hold Shift to move quicker. Click any artwork to step up to it; press Space to search and teleport, M for the museum map, and Esc for the menu.",
    "Take your time — and enjoy the music.",
  ],
};

/** ── Supporters / top donators (EDIT freely) ── */
export const DONATORS: { name: string; note?: string }[] = [
  { name: "Your Name Here", note: "Founding Patron" },
  { name: "A Generous Visitor", note: "Gold Supporter" },
  { name: "Another Kind Soul", note: "Supporter" },
  { name: "— add supporters in src/data/lobbyFrames.ts —" },
];

/** ── Credits & links (EDIT the URLs) ── */
export const CREDITS = {
  author: "Created by Arda",
  blurb:
    "A passion project built with React, Three.js and the open knowledge of Wikimedia.",
  links: [
    { label: "GitHub", url: "https://github.com/ardacanbakis" },
    { label: "Buy me a coffee", url: "https://www.buymeacoffee.com/" },
    // { label: "X / Twitter", url: "https://x.com/yourhandle" },
  ],
};

/** Frame placements on the atrium walls (atrium is 30×20, centered at 0,0). */
export const FRAMES: FrameDef[] = [
  {
    id: "welcome",
    kind: "welcome",
    title: "Welcome",
    position: [0, 1.7, -9.6], // north wall, faces +Z into the lobby
    rotationY: 0,
    width: 4.6,
    height: 2.7,
  },
  {
    id: "donators",
    kind: "donators",
    title: "Our Supporters",
    position: [0, 1.95, 9.6], // south wall, faces -Z (the giant frame)
    rotationY: Math.PI,
    width: 6.6,
    height: 3.3,
  },
  {
    id: "credits",
    kind: "credits",
    title: "Credits",
    position: [-14.6, 1.6, -4], // west wall, faces +X
    rotationY: Math.PI / 2,
    width: 2.2,
    height: 2.8,
  },
  {
    id: "guestbook",
    kind: "guestbook",
    title: "Visitors' Book",
    position: [14.6, 1.75, 4], // east wall, faces -X
    rotationY: -Math.PI / 2,
    width: 2.8,
    height: 3.1,
  },
];

export const frameById = new Map(FRAMES.map((f) => [f.id, f]));
