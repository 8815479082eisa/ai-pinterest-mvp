import Uploader from "@/components/Uploader";
import type { Entity, ImageRow } from "@/lib/data";
import { createClient, getUser } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEntity, deleteImage, setImagePublished, updateEntity } from "../actions";

const field = "mt-2 w-full border-b border-ink bg-transparent py-2 outline-none";
const label = "block text-[11px] uppercase tracking-[0.25em] text-mute";

export default async function EditEntity({ params, searchParams }: PageProps<"/studio/[id]">) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const user = await getUser();
  const supabase = await createClient();

  const { data: entity } = await supabase
    .from("entities")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .maybeSingle<Entity>();
  if (!entity) notFound();

  const { data } = await supabase
    .from("images")
    .select("*")
    .eq("entity_id", id)
    .order("created_at", { ascending: false });
  const images = (data ?? []) as ImageRow[];

  const { data: quota } = await supabase.rpc("my_upload_quota");
  const { used = 0, limit = 10, resets_at } = (quota ?? {}) as { used?: number; limit?: number; resets_at?: string | null };
  const remaining = Math.max(0, limit - used);
  const resetTime = resets_at
    ? new Date(resets_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })
    : null;
  const liveCount = images.filter((i) => i.published).length;

  return (
    <div className="py-10 sm:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/studio" className="text-[11px] uppercase tracking-[0.25em] text-mute hover:text-ink">
          ← Übersicht
        </Link>
        {entity.published && (
          <Link href={`/c/${entity.slug}`} className="text-[11px] uppercase tracking-[0.25em] hover:underline">
            Öffentliches Profil ansehen →
          </Link>
        )}
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[360px_1fr]">
        {/* Profile details */}
        <aside>
          <div className="flex items-center gap-5">
            <div className="relative size-24 overflow-hidden rounded-full bg-line">
              {entity.avatar_url && <Image src={entity.avatar_url} alt="" fill sizes="96px" className="object-cover" />}
            </div>
            <Uploader entityId={id} userId={user!.id} mode="avatar" label="Avatar ändern" remaining={remaining} />
          </div>

          <form action={updateEntity.bind(null, id)} className="mt-8 space-y-6">
            <label className="block">
              <span className={label}>Name</span>
              <input name="name" defaultValue={entity.name} required className={`${field} font-serif text-3xl`} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className={label}>Adresse /c/…</span>
                <input name="slug" defaultValue={entity.slug} required className={field} />
              </label>
              <label className="block">
                <span className={label}>Typ</span>
                <select name="kind" defaultValue={entity.kind} className={field}>
                  <option value="character">Charakter</option>
                  <option value="brand">Marke</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className={label}>Kurzbeschreibung</span>
              <input name="tagline" defaultValue={entity.tagline} className={field} />
            </label>
            <label className="block">
              <span className={label}>Bio</span>
              <textarea name="bio" defaultValue={entity.bio} rows={5} className={`${field} resize-y`} />
            </label>
            <label className="block">
              <span className={label}>Creator-Name (öffentlich)</span>
              <input name="creator" defaultValue={entity.creator} className={field} />
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="published" defaultChecked={entity.published} className="size-4 accent-black" />
              Profil ist öffentlich (live)
            </label>
            <button className="w-full rounded-full bg-ink py-3.5 text-[11px] uppercase tracking-[0.25em] text-paper transition hover:opacity-80">
              Speichern
            </button>
            {saved && <p className="text-sm text-mute">Gespeichert.</p>}
            {error && <p className="text-sm text-red-700">Fehler: {error}</p>}
          </form>

          <form action={deleteEntity.bind(null, id)} className="mt-10 border-t border-line pt-6">
            <button className="text-[11px] uppercase tracking-[0.25em] text-mute transition hover:text-red-700">
              Profil und alle Bilder löschen
            </button>
          </form>
        </aside>

        {/* Images */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[11px] uppercase tracking-[0.3em] text-mute">
              {images.length} Bilder · {liveCount} live
            </p>
            <Uploader entityId={id} userId={user!.id} mode="images" label="Bilder hochladen" remaining={remaining} />
          </div>
          <p className="mt-3 text-sm">
            Uploads diese Stunde: <span className="tabular-nums">{used} / {limit}</span>
            {remaining === 0 && resetTime && <span className="text-mute"> · wieder möglich ab {resetTime} Uhr</span>}
          </p>
          <p className="mt-1 text-sm text-mute">
            Max. {limit} Bilder pro Stunde, je max. 10 MB (JPG, PNG, WebP). Neue Bilder sind zuerst Entwürfe. Klicke auf „Live schalten“, damit sie im Profil und im Feed erscheinen.
          </p>

          {images.length === 0 ? (
            <p className="mt-16 text-mute">Noch keine Bilder.</p>
          ) : (
            <div className="mt-8 columns-2 gap-4 md:columns-3">
              {images.map((img) => (
                <figure key={img.id} className="mb-4 break-inside-avoid">
                  <div className={`relative overflow-hidden bg-line transition ${img.published ? "" : "opacity-45"}`}>
                    <Image src={img.url} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 768px) 25vw, 50vw" className="h-auto w-full" />
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] ${
                        img.published ? "bg-ink text-paper" : "bg-paper text-ink"
                      }`}
                    >
                      {img.published ? "Live" : "Entwurf"}
                    </span>
                  </div>
                  <figcaption className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                    <form action={setImagePublished.bind(null, img.id, id, !img.published)}>
                      <button className="transition hover:underline">{img.published ? "Offline nehmen" : "Live schalten"}</button>
                    </form>
                    <form action={deleteImage.bind(null, img.id, id)}>
                      <button className="text-mute transition hover:text-red-700">Löschen</button>
                    </form>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
