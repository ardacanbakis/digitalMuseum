import type { ArtworkEntry } from "./types";

/**
 * Curated artwork manifest: stable identifiers + layout metadata only.
 * All descriptions, facts, and images are fetched live at runtime.
 *
 * Every wikidataId/wikipediaTitle pair below was verified against
 * wikidata.org and en.wikipedia.org (2026-06). Where a work belongs to a
 * series (Bedroom in Arles, The Card Players), the Q-ID matches the main
 * English Wikipedia article rather than an individual version's item.
 *
 * Phase 2: Impressionism & Post-Impressionism room (~30 works).
 * Phase 4 extends this to all rooms (120–150 works).
 */
export const manifest: ArtworkEntry[] = [
  // --- Manet (precursor, hung with the Impressionists) ---
  { wikidataId: "Q152509", wikipediaTitle: "Le Déjeuner sur l'herbe", type: "painting", room: "impressionism" },
  { wikidataId: "Q737062", wikipediaTitle: "Olympia (Manet)", type: "painting", room: "impressionism" },
  { wikidataId: "Q1245354", wikipediaTitle: "A Bar at the Folies-Bergère", type: "painting", room: "impressionism" },

  // --- Monet ---
  { wikidataId: "Q328523", wikipediaTitle: "Impression, Sunrise", type: "painting", room: "impressionism" },
  { wikidataId: "Q2395218", wikipediaTitle: "Woman with a Parasol – Madame Monet and Her Son", type: "painting", room: "impressionism" },
  { wikidataId: "Q4429116", wikipediaTitle: "The Magpie (Monet)", type: "painting", room: "impressionism" },

  // --- Renoir ---
  { wikidataId: "Q1167907", wikipediaTitle: "Luncheon of the Boating Party", type: "painting", room: "impressionism" },
  { wikidataId: "Q683274", wikipediaTitle: "Bal du moulin de la Galette", type: "painting", room: "impressionism" },
  { wikidataId: "Q4451145", wikipediaTitle: "Dance at Bougival", type: "painting", room: "impressionism" },

  // --- Degas ---
  { wikidataId: "Q1239950", wikipediaTitle: "L'Absinthe", type: "painting", room: "impressionism" },
  { wikidataId: "Q2622172", wikipediaTitle: "The Bellelli Family", type: "painting", room: "impressionism" },

  // --- Caillebotte ---
  { wikidataId: "Q1452762", wikipediaTitle: "Paris Street; Rainy Day", type: "painting", room: "impressionism" },
  { wikidataId: "Q1766454", wikipediaTitle: "Les raboteurs de parquet", type: "painting", room: "impressionism" },

  // --- Morisot / Cassatt ---
  { wikidataId: "Q5966403", wikipediaTitle: "The Cradle (Morisot)", type: "painting", room: "impressionism" },
  { wikidataId: "Q3172226", wikipediaTitle: "The Child's Bath", type: "painting", room: "impressionism" },
  { wikidataId: "Q15876324", wikipediaTitle: "The Boating Party", type: "painting", room: "impressionism" },

  // --- Van Gogh ---
  { wikidataId: "Q45585", wikipediaTitle: "The Starry Night", type: "painting", room: "impressionism" },
  { wikidataId: "Q1025704", wikipediaTitle: "Café Terrace at Night", type: "painting", room: "impressionism" },
  { wikidataId: "Q724377", wikipediaTitle: "Bedroom in Arles", type: "painting", room: "impressionism" },
  { wikidataId: "Q154469", wikipediaTitle: "The Potato Eaters", type: "painting", room: "impressionism" },
  { wikidataId: "Q634122", wikipediaTitle: "Wheatfield with Crows", type: "painting", room: "impressionism" },
  { wikidataId: "Q19363211", wikipediaTitle: "Self-Portrait with Bandaged Ear", type: "painting", room: "impressionism" },
  { wikidataId: "Q2282256", wikipediaTitle: "Irises (painting)", type: "painting", room: "impressionism" },

  // --- Cézanne ---
  { wikidataId: "Q17277950", wikipediaTitle: "The Card Players", type: "painting", room: "impressionism" },
  { wikidataId: "Q3956440", wikipediaTitle: "The Basket of Apples", type: "painting", room: "impressionism" },
  { wikidataId: "Q2270938", wikipediaTitle: "The Bathers (Cézanne)", type: "painting", room: "impressionism" },

  // --- Seurat ---
  { wikidataId: "Q1044742", wikipediaTitle: "A Sunday Afternoon on the Island of La Grande Jatte", type: "painting", room: "impressionism" },
  { wikidataId: "Q1090837", wikipediaTitle: "Bathers at Asnières", type: "painting", room: "impressionism" },

  // --- Gauguin ---
  { wikidataId: "Q890678", wikipediaTitle: "Where Do We Come From? What Are We? Where Are We Going?", type: "painting", room: "impressionism" },
  { wikidataId: "Q500951", wikipediaTitle: "The Yellow Christ", type: "painting", room: "impressionism" },
  { wikidataId: "Q930535", wikipediaTitle: "Tahitian Women on the Beach", type: "painting", room: "impressionism" },

  // --- Toulouse-Lautrec ---
  { wikidataId: "Q3607521", wikipediaTitle: "At the Moulin Rouge", type: "painting", room: "impressionism" },
];

export function entriesForRoom(room: ArtworkEntry["room"]): ArtworkEntry[] {
  return manifest.filter((e) => e.room === room);
}
