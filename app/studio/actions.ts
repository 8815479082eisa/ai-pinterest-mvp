"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Every action runs as the signed-in creator; RLS guarantees they only touch their own rows. */
async function session() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return { supabase, user: data.user };
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "profil";

export async function createEntity(formData: FormData) {
  const { supabase, user } = await session();
  const name = String(formData.get("name") ?? "").trim() || "Ohne Namen";
  const kind = formData.get("kind") === "brand" ? "brand" : "character";

  // make the slug unique by appending a short random suffix if needed
  let slug = slugify(name).padEnd(2, "x");
  const { data: taken } = await supabase.from("entities").select("id").eq("slug", slug).maybeSingle();
  if (taken) slug = `${slug.slice(0, 34)}-${crypto.randomUUID().slice(0, 5)}`;

  const { data, error } = await supabase
    .from("entities")
    .insert({ owner_id: user.id, name, kind, slug, creator: user.email?.split("@")[0] ?? "" })
    .select("id")
    .single();
  if (error) throw error;
  redirect(`/studio/${data.id}`);
}

export async function updateEntity(id: string, formData: FormData) {
  const { supabase } = await session();
  const { error } = await supabase
    .from("entities")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      slug: slugify(String(formData.get("slug") ?? "")),
      kind: formData.get("kind") === "brand" ? "brand" : "character",
      tagline: String(formData.get("tagline") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      creator: String(formData.get("creator") ?? "").trim(),
      published: formData.get("published") === "on",
    })
    .eq("id", id);
  if (error) redirect(`/studio/${id}?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/", "layout");
  redirect(`/studio/${id}?saved=1`);
}

export async function deleteEntity(id: string) {
  const { supabase } = await session();
  const { data: imgs } = await supabase.from("images").select("storage_path").eq("entity_id", id);
  const paths = (imgs ?? []).map((i) => i.storage_path).filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from("images").remove(paths);
  await supabase.from("entities").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/studio");
}

export type UploadedImage = { url: string; path: string; width: number; height: number; alt: string };

/** Called by the uploader after the files are in storage. New images start as drafts. */
export async function addImages(entityId: string, images: UploadedImage[]) {
  const { supabase, user } = await session();
  const { error } = await supabase.from("images").insert(
    images.map((img) => ({
      entity_id: entityId,
      owner_id: user.id,
      url: img.url,
      storage_path: img.path,
      width: img.width,
      height: img.height,
      alt: img.alt,
      published: false,
    })),
  );
  if (error) throw error;
  revalidatePath(`/studio/${entityId}`);
}

export async function setAvatar(entityId: string, url: string) {
  const { supabase } = await session();
  await supabase.from("entities").update({ avatar_url: url }).eq("id", entityId);
  revalidatePath("/", "layout");
}

export async function setImagePublished(imageId: string, entityId: string, published: boolean) {
  const { supabase } = await session();
  await supabase.from("images").update({ published }).eq("id", imageId);
  revalidatePath("/", "layout");
  revalidatePath(`/studio/${entityId}`);
}

export async function deleteImage(imageId: string, entityId: string) {
  const { supabase } = await session();
  const { data } = await supabase.from("images").select("storage_path").eq("id", imageId).single();
  if (data?.storage_path) await supabase.storage.from("images").remove([data.storage_path]);
  await supabase.from("images").delete().eq("id", imageId);
  revalidatePath("/", "layout");
  revalidatePath(`/studio/${entityId}`);
}
