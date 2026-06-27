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
];

/** Buy Me a Coffee support link (used on the credits + supporters frames). */
export const COFFEE_URL = "https://buymeacoffee.com/ardacanbakis";

/** This project's repository (main branch). */
export const REPO_URL = "https://github.com/ardacanbakis/digitalMuseum/tree/main";

/** ── Credits text ── */
export const CREDITS = {
  author: "Created by Arda Canbakış",
  blurb:
    "A passion project built with React, Three.js and the open knowledge of Wikimedia.",
};

/** Website + socials shown in the welcome-frame footer and the pause menu. */
export type SocialIcon =
  | "globe"
  | "github"
  | "instagram"
  | "youtube"
  | "spotify"
  | "linkedin";

export const SOCIAL_LINKS: { label: string; url: string; icon: SocialIcon }[] = [
  { label: "Website", url: "https://ardacanbakis.com", icon: "globe" },
  { label: "GitHub", url: "https://github.com/ardacanbakis", icon: "github" },
  {
    label: "Instagram",
    url: "https://www.instagram.com/arda.canbakiss/",
    icon: "instagram",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@arda.canbakis",
    icon: "youtube",
  },
  {
    label: "Spotify",
    url: "https://open.spotify.com/user/11146430303",
    icon: "spotify",
  },
  {
    label: "LinkedIn",
    url: "http://linkedin.com/in/ardacanbakis",
    icon: "linkedin",
  },
];

/** Frame placements on the atrium walls (atrium is 30×20, centered at 0,0). */
export const FRAMES: FrameDef[] = [
  {
    id: "welcome",
    kind: "welcome",
    title: "Welcome to the Digital Museum",
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
    position: [-14.6, 1.5, -4.5], // west wall, faces +X (compact)
    rotationY: Math.PI / 2,
    width: 1.7,
    height: 2.0,
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
