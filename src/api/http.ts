/** Identifies us to Wikimedia per their API etiquette guidelines. */
export const API_USER_AGENT =
  "DigitalMuseum/0.1 (https://github.com/ardacanbakis/digitalmuseum)";

const RETRY_DELAY_MS = 800;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Fetch JSON with the Api-User-Agent header and one retry on failure. */
export async function fetchJson<T>(url: string, retries = 1): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS * attempt);
    try {
      const res = await fetch(url, {
        headers: {
          "Api-User-Agent": API_USER_AGENT,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
        // Client errors other than rate-limiting won't improve on retry
        if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
        continue;
      }
      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/** Run an async mapper over items with bounded concurrency. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}
