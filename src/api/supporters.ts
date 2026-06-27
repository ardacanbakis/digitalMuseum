import { DONATORS } from "../data/lobbyFrames";
import {
  localId,
  restHeaders,
  restUrl,
  supabaseConfigured,
} from "./supabaseRest";

/**
 * Top supporters. Shared/editable via a Supabase `supporters` table when
 * configured; otherwise per-browser localStorage seeded from the static
 * DONATORS list. Admin writes are authorized by the x-admin-key header.
 *
 * ── Supabase setup ──
 *   create table supporters (
 *     id uuid primary key default gen_random_uuid(),
 *     created_at timestamptz default now(),
 *     name text not null,
 *     note text
 *   );
 *   alter table supporters enable row level security;
 *   create policy "read supporters" on supporters for select using (true);
 *   create policy "admin add supporters" on supporters for insert with check (
 *     current_setting('request.headers', true)::json->>'x-admin-key'
 *       = 'YOUR_ADMIN_SECRET'
 *   );
 *   create policy "admin remove supporters" on supporters for delete using (
 *     current_setting('request.headers', true)::json->>'x-admin-key'
 *       = 'YOUR_ADMIN_SECRET'
 *   );
 */

export interface Supporter {
  id: string;
  name: string;
  note?: string;
}

const LOCAL_KEY = "dm:supporters";

function seed(): Supporter[] {
  return DONATORS.map((d, i) => ({ id: `seed-${i}`, name: d.name, note: d.note }));
}

function readLocal(): Supporter[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw) as Supporter[];
  } catch {
    // ignore
  }
  return seed();
}

function writeLocal(list: Supporter[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export async function fetchSupporters(): Promise<Supporter[]> {
  if (!supabaseConfigured()) return readLocal();
  const res = await fetch(
    restUrl("supporters?select=id,name,note&order=created_at.asc"),
    { headers: restHeaders() },
  );
  if (!res.ok) throw new Error(`Supporters fetch failed (${res.status})`);
  return (await res.json()) as Supporter[];
}

export async function addSupporter(
  name: string,
  note: string,
  adminKey: string,
): Promise<Supporter> {
  const clean = { name: name.trim().slice(0, 80), note: note.trim().slice(0, 80) };
  if (!clean.name) throw new Error("Name required");

  if (!supabaseConfigured()) {
    const entry: Supporter = { id: localId("sup"), ...clean };
    writeLocal([...readLocal(), entry]);
    return entry;
  }
  const res = await fetch(restUrl("supporters"), {
    method: "POST",
    headers: restHeaders({ "x-admin-key": adminKey, Prefer: "return=representation" }),
    body: JSON.stringify(clean),
  });
  if (!res.ok) throw new Error(`Add failed (${res.status})`);
  return ((await res.json()) as Supporter[])[0];
}

export async function deleteSupporter(
  id: string,
  adminKey: string,
): Promise<void> {
  if (!supabaseConfigured()) {
    writeLocal(readLocal().filter((s) => s.id !== id));
    return;
  }
  const res = await fetch(restUrl(`supporters?id=eq.${encodeURIComponent(id)}`), {
    method: "DELETE",
    headers: restHeaders({ "x-admin-key": adminKey }),
  });
  if (!res.ok) throw new Error(`Remove failed (${res.status})`);
}
