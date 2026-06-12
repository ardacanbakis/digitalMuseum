/**
 * Ambient music manifest. Licensing rule: the RECORDINGS themselves must
 * be public domain / freely licensed — all files here are hosted on
 * Wikimedia Commons (which only accepts free media) and each entry links
 * to its file page where the exact license is stated.
 *
 * Filenames are verified against commons.wikimedia.org; audio streams via
 * the same Special:FilePath pattern used for images (no CORS needed for
 * <audio> playback).
 */
export interface Track {
  composer: string;
  title: string;
  performer?: string;
  /** Exact Commons filename (the part after "File:"). */
  filename: string;
  license: string;
}

export const playlist: Track[] = [
  {
    composer: "Erik Satie",
    title: "Gymnopédie No. 1",
    filename: "Erik Satie - gymnopedies - la 1 ere. lent et douloureux.ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "Claude Debussy",
    title: "Clair de lune",
    performer: "Laurens Goedhart",
    filename: "Clair de lune (Claude Debussy) Suite bergamasque.ogg",
    license: "Creative Commons",
  },
  {
    composer: "Claude Debussy",
    title: "Première Arabesque",
    performer: "Patrizia Prati",
    filename: "Claude Debussy - Première Arabesque - Patrizia Prati.ogg",
    license: "CC BY-SA 4.0",
  },
  {
    composer: "Frédéric Chopin",
    title: "Nocturne Op. 9 No. 2",
    filename: "Frederic Chopin - Nocturne Eb major Opus 9, number 2.ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "Frédéric Chopin",
    title: "Prelude Op. 28 No. 15 “Raindrop”",
    performer: "Giorgi Latsabidze",
    filename: "Chopin Prelude Op 28 N 15 Giorgi Latsabidze performs.ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "Ludwig van Beethoven",
    title: "Moonlight Sonata, I. Adagio sostenuto",
    performer: "Musopen",
    filename:
      "Ludwig van Beethoven - sonata no. 14 in c sharp minor 'moonlight', op. 27 no. 2 - i. adagio sostenuto.ogg",
    license: "Public domain (Musopen)",
  },
  {
    composer: "Ludwig van Beethoven",
    title: "Für Elise",
    performer: "JMC Han",
    filename: "For Elise (Für Elise) Beethoven JMC Han.ogg",
    license: "CC BY-SA 4.0",
  },
  {
    composer: "J. S. Bach",
    title: "Air on the G String",
    filename: "Air (Bach).ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "J. S. Bach",
    title: "Cello Suite No. 1, Prelude",
    performer: "John Michel",
    filename: "JOHN MICHEL CELLO-J S BACH CELLO SUITE 1 in G Prelude.ogg",
    license: "Creative Commons",
  },
  {
    composer: "Antonio Vivaldi",
    title: "The Four Seasons — Spring, I. Allegro",
    performer: "John Harrison",
    filename: "01 - Vivaldi Spring mvt 1 Allegro - John Harrison violin.ogg",
    license: "Creative Commons",
  },
  {
    composer: "W. A. Mozart",
    title: "Eine kleine Nachtmusik, I. Allegro",
    filename: "Mozart - Eine kleine Nachtmusik - 1. Allegro.ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "Johann Pachelbel",
    title: "Canon in D",
    performer: "Kevin MacLeod",
    filename: "Kevin MacLeod - Canon in D Major.ogg",
    license: "CC BY 3.0",
  },
  {
    composer: "Franz Schubert",
    title: "Ständchen (Serenade), D 957",
    performer: "Jason Han",
    filename: "Ständchen (Schubert)-Serenade D957 No.4, Player Jason, Han.ogg",
    license: "Free license (Commons)",
  },
  {
    composer: "Camille Saint-Saëns",
    title: "The Swan",
    performer: "John Michel",
    filename: "JOHN MICHEL CELLO-SAINT SAENS CARNIVAL OF ANIMALS THE SWAN.ogg",
    license: "CC BY-SA 3.0",
  },
  {
    composer: "P. I. Tchaikovsky",
    title: "The Seasons — June (Barcarolle)",
    filename: "Tchaikovsky the Seasons June.ogg",
    license: "CC BY-SA 2.0 DE",
  },
];

export function trackUrl(track: Track): string {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(track.filename)}`;
}

/** Commons file page — the license/source link shown in the player. */
export function trackPageUrl(track: Track): string {
  return `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(track.filename.replace(/ /g, "_"))}`;
}
