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
 * Phase 4: ~140 works across six era rooms.
 */
export const manifest: ArtworkEntry[] = [
  // ════════ RENAISSANCE HALL ════════
  // --- Leonardo ---
  { wikidataId: "Q12418", wikipediaTitle: "Mona Lisa", type: "painting", room: "renaissance" },
  { wikidataId: "Q128910", wikipediaTitle: "The Last Supper (Leonardo)", type: "painting", room: "renaissance" },
  { wikidataId: "Q474338", wikipediaTitle: "Lady with an Ermine", type: "painting", room: "renaissance" },
  // --- Botticelli ---
  { wikidataId: "Q151047", wikipediaTitle: "The Birth of Venus", type: "painting", room: "renaissance" },
  { wikidataId: "Q549847", wikipediaTitle: "Primavera (Botticelli)", type: "painting", room: "renaissance" },
  // --- Raphael ---
  { wikidataId: "Q186953", wikipediaTitle: "The School of Athens", type: "painting", room: "renaissance" },
  { wikidataId: "Q328079", wikipediaTitle: "Sistine Madonna", type: "painting", room: "renaissance" },
  { wikidataId: "Q2344437", wikipediaTitle: "Transfiguration (Raphael)", type: "painting", room: "renaissance" },
  // --- Michelangelo (frescoes) ---
  { wikidataId: "Q500242", wikipediaTitle: "The Creation of Adam", type: "painting", room: "renaissance" },
  { wikidataId: "Q567861", wikipediaTitle: "The Last Judgment (Michelangelo)", type: "painting", room: "renaissance" },
  // --- Titian / Veronese ---
  { wikidataId: "Q727875", wikipediaTitle: "Venus of Urbino", type: "painting", room: "renaissance" },
  { wikidataId: "Q1206860", wikipediaTitle: "Bacchus and Ariadne", type: "painting", room: "renaissance" },
  { wikidataId: "Q185255", wikipediaTitle: "The Wedding at Cana (Veronese)", type: "painting", room: "renaissance" },
  // --- Dürer ---
  { wikidataId: "Q2546309", wikipediaTitle: "Self-Portrait (Dürer, Munich)", type: "painting", room: "renaissance" },
  { wikidataId: "Q699388", wikipediaTitle: "Young Hare", type: "painting", room: "renaissance" },
  { wikidataId: "Q699552", wikipediaTitle: "Praying Hands (Dürer)", type: "painting", room: "renaissance" },
  // --- Northern Renaissance ---
  { wikidataId: "Q220859", wikipediaTitle: "Arnolfini Portrait", type: "painting", room: "renaissance" },
  { wikidataId: "Q734834", wikipediaTitle: "Ghent Altarpiece", type: "painting", room: "renaissance" },
  { wikidataId: "Q321303", wikipediaTitle: "The Garden of Earthly Delights", type: "painting", room: "renaissance" },
  { wikidataId: "Q15293656", wikipediaTitle: "The Tower of Babel (Bruegel)", type: "painting", room: "renaissance" },
  { wikidataId: "Q500985", wikipediaTitle: "The Hunters in the Snow", type: "painting", room: "renaissance" },
  { wikidataId: "Q1212937", wikipediaTitle: "The Ambassadors (Holbein)", type: "painting", room: "renaissance" },
  // --- Mantegna / Ghirlandaio ---
  { wikidataId: "Q546297", wikipediaTitle: "Lamentation of Christ (Mantegna)", type: "painting", room: "renaissance" },
  { wikidataId: "Q23915", wikipediaTitle: "An Old Man and his Grandson", type: "painting", room: "renaissance" },

  // ════════ BAROQUE & DUTCH GOLDEN AGE ════════
  // --- Rembrandt ---
  { wikidataId: "Q219831", wikipediaTitle: "The Night Watch", type: "painting", room: "baroque" },
  { wikidataId: "Q661378", wikipediaTitle: "The Anatomy Lesson of Dr. Nicolaes Tulp", type: "painting", room: "baroque" },
  { wikidataId: "Q512755", wikipediaTitle: "The Return of the Prodigal Son (Rembrandt)", type: "painting", room: "baroque" },
  { wikidataId: "Q2246489", wikipediaTitle: "The Storm on the Sea of Galilee", type: "painting", room: "baroque" },
  { wikidataId: "Q2872725", wikipediaTitle: "Self-Portrait with Two Circles", type: "painting", room: "baroque" },
  // --- Vermeer ---
  { wikidataId: "Q185372", wikipediaTitle: "Girl with a Pearl Earring", type: "painting", room: "baroque" },
  { wikidataId: "Q167605", wikipediaTitle: "The Milkmaid (Vermeer)", type: "painting", room: "baroque" },
  { wikidataId: "Q523974", wikipediaTitle: "View of Delft", type: "painting", room: "baroque" },
  { wikidataId: "Q588695", wikipediaTitle: "The Art of Painting", type: "painting", room: "baroque" },
  { wikidataId: "Q544315", wikipediaTitle: "The Astronomer (Vermeer)", type: "painting", room: "baroque" },
  // --- Velázquez ---
  { wikidataId: "Q208758", wikipediaTitle: "Las Meninas", type: "painting", room: "baroque" },
  { wikidataId: "Q1133420", wikipediaTitle: "The Surrender of Breda", type: "painting", room: "baroque" },
  { wikidataId: "Q275349", wikipediaTitle: "Rokeby Venus", type: "painting", room: "baroque" },
  // --- Caravaggio ---
  { wikidataId: "Q969377", wikipediaTitle: "The Calling of Saint Matthew", type: "painting", room: "baroque" },
  { wikidataId: "Q2470123", wikipediaTitle: "Judith Beheading Holofernes (Caravaggio)", type: "painting", room: "baroque" },
  { wikidataId: "Q318947", wikipediaTitle: "Supper at Emmaus (Caravaggio, London)", type: "painting", room: "baroque" },
  { wikidataId: "Q2293905", wikipediaTitle: "Medusa (Caravaggio)", type: "painting", room: "baroque" },
  // --- Gentileschi / Rubens / Hals ---
  { wikidataId: "Q2247406", wikipediaTitle: "Judith Slaying Holofernes (Artemisia Gentileschi, Naples)", type: "painting", room: "baroque" },
  { wikidataId: "Q2667782", wikipediaTitle: "The Descent from the Cross (Rubens, 1612–1614)", type: "painting", room: "baroque" },
  { wikidataId: "Q1195238", wikipediaTitle: "The Garden of Love (Rubens)", type: "painting", room: "baroque" },
  { wikidataId: "Q965124", wikipediaTitle: "Laughing Cavalier", type: "painting", room: "baroque" },
  // --- Poussin / Claude / Fabritius ---
  { wikidataId: "Q1140358", wikipediaTitle: "Et in Arcadia ego (Poussin)", type: "painting", room: "baroque" },
  { wikidataId: "Q7731855", wikipediaTitle: "The Embarkation of the Queen of Sheba", type: "painting", room: "baroque" },
  { wikidataId: "Q13726073", wikipediaTitle: "The Goldfinch (painting)", type: "painting", room: "baroque" },

  // ════════ ROMANTICISM & REALISM ════════
  // --- Friedrich ---
  { wikidataId: "Q311243", wikipediaTitle: "Wanderer above the Sea of Fog", type: "painting", room: "romanticism" },
  { wikidataId: "Q194137", wikipediaTitle: "The Sea of Ice", type: "painting", room: "romanticism" },
  { wikidataId: "Q334360", wikipediaTitle: "The Abbey in the Oakwood", type: "painting", room: "romanticism" },
  // --- Delacroix / Géricault / Ingres ---
  { wikidataId: "Q29530", wikipediaTitle: "Liberty Leading the People", type: "painting", room: "romanticism" },
  { wikidataId: "Q1133821", wikipediaTitle: "The Death of Sardanapalus", type: "painting", room: "romanticism" },
  { wikidataId: "Q212616", wikipediaTitle: "The Raft of the Medusa", type: "painting", room: "romanticism" },
  { wikidataId: "Q1978815", wikipediaTitle: "Grande Odalisque", type: "painting", room: "romanticism" },
  // --- Goya ---
  { wikidataId: "Q1091086", wikipediaTitle: "The Third of May 1808", type: "painting", room: "romanticism" },
  { wikidataId: "Q1150997", wikipediaTitle: "Saturn Devouring His Son", type: "painting", room: "romanticism" },
  // --- Turner / Constable ---
  { wikidataId: "Q257580", wikipediaTitle: "The Fighting Temeraire", type: "painting", room: "romanticism" },
  { wikidataId: "Q2339059", wikipediaTitle: "Rain, Steam and Speed – The Great Western Railway", type: "painting", room: "romanticism" },
  { wikidataId: "Q219344", wikipediaTitle: "The Slave Ship", type: "painting", room: "romanticism" },
  { wikidataId: "Q2366825", wikipediaTitle: "The Hay Wain", type: "painting", room: "romanticism" },
  // --- Realists ---
  { wikidataId: "Q1368055", wikipediaTitle: "The Gleaners", type: "painting", room: "romanticism" },
  { wikidataId: "Q2571560", wikipediaTitle: "The Angelus (painting)", type: "painting", room: "romanticism" },
  { wikidataId: "Q540488", wikipediaTitle: "A Burial at Ornans", type: "painting", room: "romanticism" },
  { wikidataId: "Q2914912", wikipediaTitle: "The Stone Breakers", type: "painting", room: "romanticism" },
  { wikidataId: "Q687182", wikipediaTitle: "Whistler's Mother", type: "painting", room: "romanticism" },
  // --- Victorian / late Romantics ---
  { wikidataId: "Q1065493", wikipediaTitle: "Ophelia (painting)", type: "painting", room: "romanticism" },
  { wikidataId: "Q2445726", wikipediaTitle: "The Lady of Shalott (painting)", type: "painting", room: "romanticism" },
  { wikidataId: "Q1195035", wikipediaTitle: "The Kiss (Hayez)", type: "painting", room: "romanticism" },
  { wikidataId: "Q1070896", wikipediaTitle: "The Ninth Wave", type: "painting", room: "romanticism" },

  // ════════ MODERN WING ════════
  // --- Munch / Klimt / Schiele-era Vienna ---
  { wikidataId: "Q471379", wikipediaTitle: "The Scream", type: "painting", room: "modern" },
  { wikidataId: "Q1989780", wikipediaTitle: "Madonna (Munch)", type: "painting", room: "modern" },
  { wikidataId: "Q698487", wikipediaTitle: "The Kiss (Klimt)", type: "painting", room: "modern" },
  { wikidataId: "Q354396", wikipediaTitle: "Portrait of Adele Bloch-Bauer I", type: "painting", room: "modern" },
  { wikidataId: "Q17001535", wikipediaTitle: "Death and Life", type: "painting", room: "modern" },
  // --- Abstraction ---
  { wikidataId: "Q2990634", wikipediaTitle: "Composition VII", type: "painting", room: "modern" },
  { wikidataId: "Q2915406", wikipediaTitle: "Broadway Boogie Woogie", type: "painting", room: "modern" },
  { wikidataId: "Q19609193", wikipediaTitle: "Composition with Red, Blue and Yellow", type: "painting", room: "modern" },
  { wikidataId: "Q1170315", wikipediaTitle: "Black Square", type: "painting", room: "modern" },
  // --- Rousseau ---
  { wikidataId: "Q1219263", wikipediaTitle: "The Sleeping Gypsy", type: "painting", room: "modern" },
  { wikidataId: "Q960447", wikipediaTitle: "Tiger in a Tropical Storm", type: "painting", room: "modern" },
  // --- Picasso / Matisse (post-1929 images may fall back to fair-use thumbnails) ---
  { wikidataId: "Q175036", wikipediaTitle: "Guernica (Picasso)", type: "painting", room: "modern" },
  { wikidataId: "Q910199", wikipediaTitle: "Les Demoiselles d'Avignon", type: "painting", room: "modern" },
  { wikidataId: "Q3228112", wikipediaTitle: "The Old Guitarist", type: "painting", room: "modern" },
  { wikidataId: "Q164517", wikipediaTitle: "Dance (Matisse)", type: "painting", room: "modern" },
  // --- Surrealism ---
  { wikidataId: "Q25729", wikipediaTitle: "The Persistence of Memory", type: "painting", room: "modern" },
  { wikidataId: "Q1061035", wikipediaTitle: "The Treachery of Images", type: "painting", room: "modern" },
  { wikidataId: "Q1151384", wikipediaTitle: "The Son of Man", type: "painting", room: "modern" },
  // --- Americas ---
  { wikidataId: "Q83872", wikipediaTitle: "Nighthawks (Hopper)", type: "painting", room: "modern" },
  { wikidataId: "Q464782", wikipediaTitle: "American Gothic", type: "painting", room: "modern" },
  { wikidataId: "Q2465911", wikipediaTitle: "Christina's World", type: "painting", room: "modern" },
  { wikidataId: "Q5880026", wikipediaTitle: "Self-Portrait with Thorn Necklace and Hummingbird", type: "painting", room: "modern" },

  // ════════ SCULPTURE COURT ════════
  { wikidataId: "Q151952", wikipediaTitle: "Venus de Milo", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q216402", wikipediaTitle: "Winged Victory of Samothrace", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q465762", wikipediaTitle: "Laocoön and His Sons", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q133732", wikipediaTitle: "Discobolus", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q619135", wikipediaTitle: "Apollo Belvedere", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q667124", wikipediaTitle: "Augustus of Prima Porta", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q582172", wikipediaTitle: "Nefertiti Bust", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q179900", wikipediaTitle: "David (Michelangelo)", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q235242", wikipediaTitle: "Pietà (Michelangelo)", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q1989744", wikipediaTitle: "Moses (Michelangelo)", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q735085", wikipediaTitle: "David (Donatello, bronze)", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q1333433", wikipediaTitle: "Ecstasy of Saint Teresa", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q945850", wikipediaTitle: "Apollo and Daphne (Bernini)", type: "sculpture", room: "sculpture" },
  { wikidataId: "Q18003128", wikipediaTitle: "The Thinker", type: "sculpture", room: "sculpture" },

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

export const manifestById = new Map(manifest.map((e) => [e.wikidataId, e]));
