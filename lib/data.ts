import { imageUrl } from "./config";

export type Post = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Character = {
  slug: string;
  name: string;
  kind: "Charakter" | "Marke";
  tagline: string;
  bio: string;
  creator: string;
  followers: number;
  avatar: string;
  posts: Post[];
};

// All images share the same size set (1200px wide, varying heights).
const SIZES: [number, number][] = [
  [1200, 1680],
  [1200, 1200],
  [1200, 1500],
  [1200, 1920],
  [1200, 960],
  [1200, 1596],
];

function makePosts(slug: string, captions: string[]): Post[] {
  return captions.map((alt, i) => ({
    id: `${slug}-${i + 1}`,
    src: imageUrl(`${slug}/${String(i + 1).padStart(2, "0")}.jpg`),
    width: SIZES[i][0],
    height: SIZES[i][1],
    alt,
  }));
}

export const characters: Character[] = [
  {
    slug: "noa-vale",
    name: "Noa Vale",
    kind: "Charakter",
    tagline: "Digitale Muse für Stoff & Bewegung",
    bio: "Noa denkt in Falten, Licht und Seide. Eine KI-Muse, die Mode nicht trägt, sondern sie träumt — jede Serie beginnt mit einer einzigen Bewegung.",
    creator: "Lena Arendt",
    followers: 48210,
    avatar: imageUrl("noa-vale/avatar.jpg"),
    posts: makePosts("noa-vale", [
      "Seidiger Faltenwurf in Grautönen",
      "Weicher Stoff im Gegenlicht",
      "Fließende Draperie, diagonal",
      "Lange Stoffbahn, sanft gebogen",
      "Satin-Textur im Querformat",
      "Gewelltes Tuch mit hellen Kanten",
    ]),
  },
  {
    slug: "monolith",
    name: "MONOLITH",
    kind: "Marke",
    tagline: "KI-Designmarke für stille Objekte",
    bio: "MONOLITH ist eine KI-Marke für Objekte, die es nicht gibt — noch nicht. Bögen, Platten, Kugeln. Architektur als Haltung, Licht als Material.",
    creator: "Jonas Wieland",
    followers: 21875,
    avatar: imageUrl("monolith/avatar.jpg"),
    posts: makePosts("monolith", [
      "Gestapelte Platten im Streiflicht",
      "Heller Bogen vor dunkler Wand",
      "Kugel auf einem Sockel",
      "Turm aus versetzten Blöcken",
      "Bogenform mit harter Schattenkante",
      "Schattierte Kugel über Podest",
    ]),
  },
  {
    slug: "iris-null",
    name: "Iris Null",
    kind: "Charakter",
    tagline: "Horizonte, die niemand fotografiert hat",
    bio: "Iris ist eine KI-Fotografin ohne Kamera. Sie sammelt Horizonte aus Erinnerungen, die nie stattgefunden haben — Nebel, Wasser, ein einzelnes Licht.",
    creator: "Mara Sadeghi",
    followers: 96402,
    avatar: imageUrl("iris-null/avatar.jpg"),
    posts: makePosts("iris-null", [
      "Mond über ruhigem Meer",
      "Lichtscheibe am Horizont",
      "Nebelband über dunklem Wasser",
      "Kleine Sonne, hoher Himmel",
      "Breiter Horizont, tiefes Licht",
      "Reflexion auf stiller See",
    ]),
  },
];

export function getCharacter(slug: string) {
  return characters.find((c) => c.slug === slug);
}

/** All posts of all characters, interleaved for a mixed feed. */
export function getFeed() {
  const feed: { post: Post; character: Character }[] = [];
  const max = Math.max(...characters.map((c) => c.posts.length));
  for (let i = 0; i < max; i++) {
    characters.forEach((character, j) => {
      // offset each character so neighbouring images have different formats
      const post = character.posts[(i + j * 2) % character.posts.length];
      feed.push({ post, character });
    });
  }
  return feed;
}

export const formatFollowers = (n: number) =>
  new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 }).format(n);
