import FollowButton from "@/components/FollowButton";
import Masonry from "@/components/Masonry";
import Pin from "@/components/Pin";
import { getPublicProfile, kindLabel } from "@/lib/data";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  return { title: profile ? `${profile.entity.name} — Muse` : "Nicht gefunden — Muse" };
}

export default async function ProfilePage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const profile = await getPublicProfile(slug);
  if (!profile) notFound();
  const { entity, images } = profile;

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
          {entity.avatar_url && (
            <Image src={entity.avatar_url} alt={`Avatar von ${entity.name}`} fill preload sizes="176px" className="object-cover" />
          )}
        </div>

        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-mute">
            KI-{kindLabel(entity.kind)}
            {entity.tagline && ` · ${entity.tagline}`}
          </p>
          <h1 className="font-serif text-6xl leading-[0.9] tracking-tight sm:text-8xl">{entity.name}</h1>
          {entity.bio && <p className="mt-6 text-base leading-relaxed text-ink/80 sm:text-lg">{entity.bio}</p>}
          {entity.creator && (
            <p className="mt-6 text-sm text-mute">
              Erschaffen von <span className="text-ink">{entity.creator}</span>
            </p>
          )}
          <div className="mt-8">
            <FollowButton followers={entity.followers} />
          </div>
        </div>
      </section>

      <section className="pt-10 sm:pt-14">
        <p className="mb-8 text-[11px] uppercase tracking-[0.3em] text-mute">{images.length} Bilder</p>
        <Masonry>
          {images.map((image) => (
            <Pin key={image.id} image={image} entity={entity} showCaption={false} />
          ))}
        </Masonry>
      </section>
    </div>
  );
}
