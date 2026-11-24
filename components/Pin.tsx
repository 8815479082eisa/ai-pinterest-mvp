import Image from "next/image";
import Link from "next/link";
import type { Entity, ImageRow } from "@/lib/data";

type Props = {
  image: ImageRow;
  entity: Entity;
  showCaption?: boolean;
  preload?: boolean;
};

/** One image tile in the masonry grid. Links to the profile of its character/brand. */
export default function Pin({ image, entity, showCaption = true, preload }: Props) {
  return (
    <Link href={`/c/${entity.slug}`} className="group mb-4 block break-inside-avoid sm:mb-6">
      <div className="relative overflow-hidden bg-line">
        <Image
          src={image.url}
          alt={image.alt || entity.name}
          width={image.width}
          height={image.height}
          preload={preload}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="h-auto w-full transition duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-90"
        />
      </div>
      {showCaption && (
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="font-serif text-lg leading-none">{entity.name}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-mute opacity-0 transition duration-500 group-hover:opacity-100">
            Profil →
          </span>
        </div>
      )}
    </Link>
  );
}
