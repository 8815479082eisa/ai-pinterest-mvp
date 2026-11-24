"use client";

import { addImages, setAvatar } from "@/app/studio/actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  entityId: string;
  userId: string;
  /** "images" = add to gallery (as drafts), "avatar" = replace the profile picture */
  mode: "images" | "avatar";
  label: string;
};

async function dimensions(file: File) {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** Uploads files straight from the browser to Supabase Storage, then registers them. */
export default function Uploader({ entityId, userId, mode, label }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const supabase = createClient();
    const uploaded = [];
    try {
      for (const [i, file] of files.entries()) {
        if (file.size > 10 * 1024 * 1024) throw new Error(`${file.name} ist größer als 10 MB.`);
        setStatus(`Lade hoch … ${i + 1}/${files.length}`);
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${userId}/${entityId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("images")
          .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
        if (error) throw error;
        const url = supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
        uploaded.push({ url, path, alt: file.name.replace(/\.[^.]+$/, ""), ...(await dimensions(file)) });
      }
      if (mode === "avatar") await setAvatar(entityId, uploaded[0].url);
      else await addImages(entityId, uploaded);
      setStatus(null);
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload fehlgeschlagen.");
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-ink px-6 py-2.5 text-[11px] uppercase tracking-[0.25em] transition hover:bg-ink hover:text-paper">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={mode === "images"}
        onChange={onChange}
        className="sr-only"
      />
      {status ?? label}
    </label>
  );
}
