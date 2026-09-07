"use client";

import { useRef, useState } from "react";
import { ImagePlus, Video, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addExperienceMedia, removeExperienceMedia } from "@/lib/actions/admin-experiences";
import { useRouter } from "next/navigation";

export interface ExistingMedia {
  id: string;
  url: string;
  type: "photo" | "video";
  caption: string | null;
}

export function ExperienceMediaManager({ experienceId, media }: { experienceId: string; media: ExistingMedia[] }) {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(type: "photo" | "video", files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const items: { path: string; type: "photo" | "video" }[] = [];

    for (const file of Array.from(files)) {
      const path = `experiences/${experienceId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error } = await supabase.storage.from("experience-media").upload(path, file);
      if (!error) items.push({ path, type });
    }

    if (items.length > 0) {
      await addExperienceMedia(experienceId, items);
      router.refresh();
    }
    setUploading(false);
  }

  async function handleRemove(mediaId: string) {
    await removeExperienceMedia(mediaId, experienceId);
    router.refresh();
  }

  return (
    <div className="card-premium p-6">
      <h3 className="heading-display text-lg">Fotos y videos</h3>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full border border-borgona-200 px-4 py-2 text-sm font-semibold text-borgona-700 hover:bg-borgona-50 disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" /> Agregar fotos
        </button>
        <button
          type="button"
          onClick={() => videoRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full border border-dorado-300 px-4 py-2 text-sm font-semibold text-dorado-500 hover:bg-dorado-50 disabled:opacity-50"
        >
          <Video className="h-4 w-4" /> Agregar video
        </button>
        <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload("photo", e.target.files)} />
        <input ref={videoRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => handleUpload("video", e.target.files)} />
      </div>

      {uploading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Subiendo...
        </p>
      )}

      {media.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10">
              {item.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={item.url} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-borgona-800/80 text-blanco opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
