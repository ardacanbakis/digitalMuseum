/** Texture width for paintings hanging on walls. */
export const GALLERY_IMAGE_WIDTH = 512;
/** Hi-res swap when an artwork is focused/zoomed. */
export const FOCUS_IMAGE_WIDTH = 1600;

/**
 * Progressive image URL from a Commons filename (Wikidata P18).
 * Special:FilePath serves a resized thumbnail at the requested width.
 */
export function commonsImageUrl(filename: string, width: number): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=${width}`;
}

/** The Commons file description page — required for attribution links. */
export function commonsFilePageUrl(filename: string): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename.replace(/ /g, "_"))}`;
}
