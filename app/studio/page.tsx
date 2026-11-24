import { kindLabel, type Entity } from "@/lib/data";
import { createClient, getUser } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { createEntity } from "./actions";

export default async function StudioHome() {
  const user = await getUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("entities")
    .select("*, images(count)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });
  const entities = (data ?? []) as (Entity & { images: { count: number }[] })[];

  return (
    <div className="py-12 sm:py-16">
      <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
        Deine <span className="italic">Charaktere & Marken</span>
      </h1>

      <form action={createEntity} className="mt-10 flex flex-wrap items-end gap-4 border border-line p-5 sm:p-6">
        <label className="flex-1 basis-60">
          <span className="block text-[11px] uppercase tracking-[0.25em] text-mute">Name</span>
          <input name="name" required placeholder="z. B. Luna Grey" className="mt-2 w-full border-b border-ink bg-transparent py-2 text-lg outline-none" />
        </label>
        <label>
          <span className="block text-[11px] uppercase tracking-[0.25em] text-mute">Typ</span>
          <select name="kind" className="mt-2 border-b border-ink bg-transparent py-2 text-lg outline-none">
            <option value="character">Charakter</option>
            <option value="brand">Marke</option>
          </select>
        </label>
        <button className="rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.25em] text-paper transition hover:opacity-80">
          Neu anlegen
        </button>
      </form>

      {entities.length === 0 ? (
        <p className="mt-16 text-mute">Noch nichts angelegt. Starte oben mit deinem ersten Charakter.</p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {entities.map((e) => (
            <li key={e.id}>
              <Link href={`/studio/${e.id}`} className="flex items-center gap-5 py-5 transition hover:bg-line/40 sm:px-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-line">
                  {e.avatar_url && <Image src={e.avatar_url} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-2xl">{e.name}</p>
                  <p className="text-xs text-mute">
                    {kindLabel(e.kind)} · {e.images[0]?.count ?? 0} Bilder · /c/{e.slug}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    e.published ? "bg-ink text-paper" : "border border-line text-mute"
                  }`}
                >
                  {e.published ? "Live" : "Entwurf"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
