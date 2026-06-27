/**
 * Shared Supabase PostgREST helpers (no SDK). When the env vars are unset,
 * callers fall back to localStorage so the app still works statically.
 *
 * Admin writes (deleting comments, editing supporters) are authorized by a
 * header token checked in the table's RLS policy — the secret is typed by
 * the admin at runtime and never shipped in the bundle. See the setup SQL
 * in src/api/guestbook.ts and src/api/supporters.ts.
 */

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON);
}

export function restUrl(path: string): string {
  return `${SUPABASE_URL}/rest/v1/${path}`;
}

export function restHeaders(extra?: Record<string, string>): HeadersInit {
  return {
    apikey: SUPABASE_ANON as string,
    Authorization: `Bearer ${SUPABASE_ANON}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/** A small id for local-only (no-Supabase) records. */
export function localId(prefix: string): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Math.floor(Math.random() * 1e9)}`;
  return `${prefix}-${rnd}`;
}
