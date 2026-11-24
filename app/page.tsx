import Masonry from "@/components/Masonry";
import Pin from "@/components/Pin";
import { getFeed, getPublishedEntities } from "@/lib/data";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [feed, entities] = await Promise.all([getFeed(), getPublishedEntities()]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-10">
      <section className="pb-12 pt-10 sm:pb-20 sm:pt-20">
        <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-mute">Ausgabe 01</p>
        <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          Bilder von Wesen, <span className="italic">die es nicht gibt.</span>
        </h1>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {entities.map((e) => (
            <li key={e.id}>
              <Link href={`/c/${e.slug}`} className="border-b border-transparent pb-0.5 transition hover:border-ink">
                {e.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Masonry>
        {feed.map((image, i) => (
          <Pin key={image.id} image={image} entity={image.entity} preload={i < 4} />
        ))}
      </Masonry>
    </div>
  );
}
