/**
 * Visitors' book backed by Supabase (free tier) via its PostgREST API —
 * no SDK, just fetch. When the env vars aren't set, it transparently
 * falls back to per-browser localStorage so the feature still works in
 * dev/preview (clearly flagged as not-shared in the UI).
 *
 * ── Supabase setup (one time) ─────────────────────────────────────────
 * 1. Create a free project at supabase.com.
 * 2. SQL editor → run:
 *
 *      create table comments (
 *        id          uuid primary key default gen_random_uuid(),
 *        created_at  timestamptz not null default now(),
 *        name        text,
 *        message     text not null
 *      );
 *      alter table comments enable row level security;
 *      create policy "anyone can read"  on comments for select using (true);
 *      create policy "anyone can post"  on comments for insert with check (
 *        char_length(message) between 1 and 1000
 *      );
 *      -- (no update/delete policy → visitors can't edit/delete;
 *      --  you moderate by deleting rows in the Supabase dashboard)
 *
 * 3. Set these env vars (e.g. in Vercel/Netlify, and a local .env):
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJ...   (the public anon key — safe in client)
 *
 * Moderation: delete unwanted rows in Table Editor → comments. The anon
 * key cannot delete (no RLS delete policy), so it's safe to ship.
 */

export interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
}

const URL_BASE = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const LOCAL_KEY = "dm:guestbook";
const MAX_LEN = 1000;

export function isGuestbookShared(): boolean {
  return Boolean(URL_BASE && ANON_KEY);
}

// Light profanity guard — rejects the most obvious slurs/abuse at submit
// time. Real moderation is deleting rows in the dashboard.
const BLOCKLIST = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "nigger",
  "faggot",
  "retard",
];

export function screenMessage(text: string): string | null {
  const t = text.trim();
  if (!t) return "Please write something first.";
  if (t.length > MAX_LEN) return `Please keep it under ${MAX_LEN} characters.`;
  const normalized = t.toLowerCase().replace(/[^a-z]/g, "");
  if (BLOCKLIST.some((w) => normalized.includes(w))) {
    return "Let's keep it friendly — please reword that.";
  }
  return null; // ok
}

function restHeaders(extra?: Record<string, string>) {
  return {
    apikey: ANON_KEY as string,
    Authorization: `Bearer ${ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function readLocal(): Comment[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? "[]") as Comment[];
  } catch {
    return [];
  }
}

export async function fetchComments(): Promise<Comment[]> {
  if (!isGuestbookShared()) {
    return readLocal().sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  const res = await fetch(
    `${URL_BASE}/rest/v1/comments?select=id,name,message,created_at&order=created_at.desc&limit=200`,
    { headers: restHeaders() },
  );
  if (!res.ok) throw new Error(`Guestbook fetch failed (${res.status})`);
  return (await res.json()) as Comment[];
}

export async function postComment(
  name: string,
  message: string,
): Promise<Comment> {
  const cleanName = name.trim().slice(0, 60) || "Anonymous";
  const cleanMessage = message.trim().slice(0, MAX_LEN);

  if (!isGuestbookShared()) {
    const entry: Comment = {
      id: `local-${readLocal().length + 1}-${cleanMessage.length}`,
      name: cleanName,
      message: cleanMessage,
      created_at: new Date().toISOString(),
    };
    const all = [entry, ...readLocal()].slice(0, 200);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(all));
    } catch {
      // quota — ignore
    }
    return entry;
  }

  const res = await fetch(`${URL_BASE}/rest/v1/comments`, {
    method: "POST",
    headers: restHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify({ name: cleanName, message: cleanMessage }),
  });
  if (!res.ok) throw new Error(`Couldn't post (${res.status})`);
  const rows = (await res.json()) as Comment[];
  return rows[0];
}
