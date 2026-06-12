import { cacheGet, cacheSet } from "./cache";
import { chunk, fetchJson } from "./http";

/** Texture width for paintings hanging on walls. */
export const GALLERY_IMAGE_WIDTH = 512;
/** Hi-res swap when an artwork is focused/zoomed. */
export const FOCUS_IMAGE_WIDTH = 1600;

/**
 * Progressive image URL from a Commons filename (Wikidata P18).
 * Special:FilePath serves a resized thumbnail at the requested width.
 *
 * NOTE: fine for <img> tags, but NOT for WebGL textures — Special:FilePath
 * responses lack CORS headers. Textures must use the direct
 * upload.wikimedia.org URLs from fetchCommonsImageUrls below.
 */
export function commonsImageUrl(filename: string, width: number): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

/** The Commons file description page — required for attribution links. */
export function commonsFilePageUrl(filename: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename.replace(/ /g, "_"))}`;
}

export interface CommonsImageUrls {
  small: string;
  large: string;
}

interface ImageInfoResponse {
  query?: {
    normalized?: { from: string; to: string }[];
    pages?: Record<
      string,
      {
        title: string;
        imageinfo?: { url: string; thumburl?: string }[];
      }
    >;
  };
}

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

/**
 * Resolve direct upload.wikimedia.org thumbnail URLs (CORS-enabled, usable
 * as WebGL textures) for Commons filenames. Batched (≤50 titles/request)
 * and cached per filename. The hi-res URL is derived from the thumbnail
 * URL pattern, avoiding a second API round-trip.
 */
export async function fetchCommonsImageUrls(
  filenames: string[],
): Promise<Record<string, CommonsImageUrls>> {
  const result: Record<string, CommonsImageUrls> = {};
  const misses: string[] = [];
  for (const filename of [...new Set(filenames)]) {
    const hit = cacheGet<CommonsImageUrls>(`ci:${filename}`);
    if (hit) result[filename] = hit;
    else misses.push(filename);
  }

  for (const batch of chunk(misses, 50)) {
    const titles = batch.map((f) => `File:${f}`).join("|");
    const url = `${COMMONS_API}?action=query&format=json&origin=*&prop=imageinfo&iiprop=url&iiurlwidth=${GALLERY_IMAGE_WIDTH}&titles=${encodeURIComponent(titles)}`;
    const json = await fetchJson<ImageInfoResponse>(url);

    // The API normalizes titles (underscores, casing) — map back
    const titleToFilename = new Map(batch.map((f) => [`File:${f}`, f]));
    for (const n of json.query?.normalized ?? []) {
      const original = titleToFilename.get(n.from);
      if (original) {
        titleToFilename.delete(n.from);
        titleToFilename.set(n.to, original);
      }
    }

    for (const page of Object.values(json.query?.pages ?? {})) {
      const filename = titleToFilename.get(page.title);
      const info = page.imageinfo?.[0];
      if (!filename || !info) continue;
      const small = info.thumburl ?? info.url;
      const marker = `/${GALLERY_IMAGE_WIDTH}px-`;
      const large = info.thumburl?.includes(marker)
        ? info.thumburl.replace(marker, `/${FOCUS_IMAGE_WIDTH}px-`)
        : small;
      const urls: CommonsImageUrls = { small, large };
      result[filename] = urls;
      cacheSet(`ci:${filename}`, urls);
    }
  }
  return result;
}
