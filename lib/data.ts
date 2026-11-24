import { createClient } from "@/lib/supabase/server";

export type Kind = "character" | "brand";

export type Entity = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  kind: Kind;
  tagline: string;
  bio: string;
  creator: string;
  avatar_url: string | null;
  followers: number;
  published: boolean;
};

export type ImageRow = {
  id: string;
  entity_id: string;
  url: string;
  storage_path: string | null;
  width: number;
  height: number;
  alt: string;
  published: boolean;
};

export const kindLabel = (kind: Kind) => (kind === "brand" ? "Marke" : "Charakter");


/** Public feed: published images of published entities (RLS enforces this too). */
export async function getFeed() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("images")
    .select("*, entity:entities!inner(*)")
    .eq("published", true)
    .eq("entity.published", true)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as (ImageRow & { entity: Entity })[];
}

/** Published entities for the navigation on the start page. */
export async function getPublishedEntities() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("entities")
    .select("*")
    .eq("published", true)
    .order("created_at");
  return (data ?? []) as Entity[];
}

/** Public profile: entity + its published images. */
export async function getPublicProfile(slug: string) {
  const supabase = await createClient();
  const { data: entity } = await supabase
    .from("entities")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Entity>();
  if (!entity) return null;
  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("entity_id", entity.id)
    .eq("published", true)
    .order("created_at", { ascending: false });
  return { entity, images: (images ?? []) as ImageRow[] };
}
