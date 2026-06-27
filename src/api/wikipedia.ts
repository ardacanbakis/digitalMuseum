import { cached } from "./cache";
import type { Lang } from "../data/i18n";
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
 * Wikipedia REST summary from the given language wiki: extract, thumbnail,
 * canonical page URL. Redirect titles resolve transparently (302). Cached
 * per language + title.
 */
export async function fetchWikipediaSummary(
  title: string,
  lang: Lang = "en",
): Promise<WikipediaSummary> {
  return cached(`wp:${lang}:${title}`, async () => {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const json = await fetchJson<RestSummaryResponse>(url);
    return {
      title: json.title ?? title,
      extract: json.extract,
      thumbnailUrl: json.thumbnail?.source,
      pageUrl:
        json.content_urls?.desktop?.page ??
        `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    };
  });
}
