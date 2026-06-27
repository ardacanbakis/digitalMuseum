export type Lang = "en" | "tr";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
];

interface Strings {
  artist: string;
  year: string;
  medium: string;
  dimensions: string;
  location: string;
  movement: string;
  source: string;
  wikiArticle: string;
  imageFile: string;
  sculptureNote: string;
  detailsError: string;
  panelHint: string;
  language: string;
}

/** UI chrome strings. Artwork content itself comes localized from the
 * Turkish/English wikis; these cover the surrounding labels. */
export const STRINGS: Record<Lang, Strings> = {
  en: {
    artist: "Artist",
    year: "Year",
    medium: "Medium",
    dimensions: "Dimensions",
    location: "Location",
    movement: "Movement",
    source: "Source: Wikipedia / Wikimedia Commons",
    wikiArticle: "Wikipedia article",
    imageFile: "Image file",
    sculptureNote:
      "Sculpture — shown here as a photograph. The original is a three-dimensional work meant to be seen in the round.",
    detailsError:
      "Details couldn’t be loaded right now — close and reopen to retry.",
    panelHint:
      "← → browse the room · scroll to zoom · drag to pan · ESC, Space, or double-click to return it to the wall",
    language: "Language",
  },
  tr: {
    artist: "Sanatçı",
    year: "Yıl",
    medium: "Malzeme",
    dimensions: "Boyutlar",
    location: "Bulunduğu yer",
    movement: "Akım",
    source: "Kaynak: Vikipedi / Wikimedia Commons",
    wikiArticle: "Vikipedi makalesi",
    imageFile: "Görsel dosyası",
    sculptureNote:
      "Heykel — burada fotoğraf olarak gösterilmektedir. Özgün eser, çevresinde dolaşılarak görülmek üzere üç boyutludur.",
    detailsError:
      "Ayrıntılar şu anda yüklenemedi — kapatıp yeniden açmayı deneyin.",
    panelHint:
      "← → odada gezin · kaydırarak yakınlaştır · sürükleyerek kaydır · ESC, Boşluk veya çift tıklama ile duvara geri koy",
    language: "Dil",
  },
};
