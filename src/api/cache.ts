/**
 * Two-level cache for API responses: in-memory Map for the session,
 * localStorage with a TTL for revisits — keeps us fast and polite to
 * Wikimedia's servers.
 */

const PREFIX = "dm:";
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface Stored<T> {
  v: T;
  exp: number;
}

const memory = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  if (memory.has(key)) return memory.get(key) as T;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as Stored<T>;
    if (Date.now() > stored.exp) {
      localStorage.removeItem(PREFIX + key);
      return undefined;
    }
    memory.set(key, stored.v);
    return stored.v;
  } catch {
    return undefined;
  }
}

export function cacheSet<T>(key: string, value: T, ttl = DEFAULT_TTL): void {
  memory.set(key, value);
  try {
    const stored: Stored<T> = { v: value, exp: Date.now() + ttl };
    localStorage.setItem(PREFIX + key, JSON.stringify(stored));
  } catch {
    // Quota exceeded or private mode — memory cache still works
  }
}

export function cacheClear(): void {
  memory.clear();
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

/**
 * Cache-through helper that also dedupes concurrent requests for the
 * same key (two rooms asking for the same artist label, etc.).
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fetcher()
    .then((value) => {
      cacheSet(key, value, ttl);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}
