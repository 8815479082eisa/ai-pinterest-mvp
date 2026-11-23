import Image from "next/image";
import Link from "next/link";
import type { Character, Post } from "@/lib/data";

type Props = {
  post: Post;
  character: Character;
  showCaption?: boolean;
  preload?: boolean;
};

/** One image tile in the masonry grid. Links to the character's profile. */
export default function Pin({ post, character, showCaption = true, preload }: Props) {
  return (
    <Link href={`/c/${character.slug}`} className="group mb-4 block break-inside-avoid sm:mb-6">
      <div className="relative overflow-hidden bg-line">
        <Image
          src={post.src}
          alt={post.alt}
          width={post.width}
          height={post.height}
          preload={preload}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
        />
      </div>
      {showCaption && (
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="font-serif text-lg leading-none">{character.name}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-mute opacity-0 transition duration-500 group-hover:opacity-100">
            Profil →
          </span>
        </div>
      )}
    </Link>
  );
}
