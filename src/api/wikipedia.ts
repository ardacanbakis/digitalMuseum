import { cached } from "./cache";
import { fetchJson } from "./http";

export interface WikipediaSummary {
  title: string;
  extract?: string;
  thumbnailUrl?: string;
  pageUrl: string;
}

interface RestSummaryResponse {
  title?: string;
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

/**
 * Wikipedia REST summary: extract, thumbnail, canonical page URL.
 * Redirect titles resolve transparently (fetch follows the 302).
 */
export async function fetchWikipediaSummary(
  title: string,
): Promise<WikipediaSummary> {
  return cached(`wp:${title}`, async () => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const json = await fetchJson<RestSummaryResponse>(url);
    return {
      title: json.title ?? title,
      extract: json.extract,
      thumbnailUrl: json.thumbnail?.source,
      pageUrl:
        json.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    };
  });
}
