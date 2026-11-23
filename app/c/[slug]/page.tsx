import FollowButton from "@/components/FollowButton";
import Masonry from "@/components/Masonry";
import Pin from "@/components/Pin";
import { characters, getCharacter } from "@/lib/data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = getCharacter(slug);
  return { title: c ? `${c.name} — Muse` : "Nicht gefunden — Muse" };
}

export default async function CharacterPage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const character = getCharacter(slug);
  if (!character) notFound();

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
      <Link
        href="/"
        className="mt-4 inline-block text-[11px] uppercase tracking-[0.25em] text-mute transition hover:text-ink"
      >
        ← Alle Bilder
      </Link>

      <section className="grid gap-10 border-b border-line pb-14 pt-10 sm:pb-20 sm:pt-16 md:grid-cols-[auto_1fr] md:gap-16">
        <div className="relative size-32 overflow-hidden rounded-full bg-line sm:size-44">
          <Image
            src={character.avatar}
            alt={`Avatar von ${character.name}`}
            fill
            preload
            sizes="176px"
            className="object-cover"
          />
        </div>

        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-mute">
            KI-{character.kind} · {character.tagline}
          </p>
          <h1 className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-8xl">{character.name}</h1>
          <p className="mt-6 text-base leading-relaxed text-ink/80 sm:text-lg">{character.bio}</p>
          <p className="mt-6 text-sm text-mute">
            Erschaffen von <span className="text-ink">{character.creator}</span>
          </p>
          <div className="mt-8">
            <FollowButton followers={character.followers} />
          </div>
        </div>
      </section>

      <section className="pt-10 sm:pt-14">
        <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-mute">
          {character.posts.length} Bilder
        </p>
        <Masonry>
          {character.posts.map((post) => (
            <Pin key={post.id} post={post} character={character} showCaption={false} />
          ))}
        </Masonry>
      </section>
    </div>
  );
}
