"use client";

import { useRef, useState } from "react";
import { ImagePlus, Video, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ConfiguratorState } from "@/lib/types";

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 3;
const MAX_SIZE_MB = 50;

type MediaFile = ConfiguratorState["mediaFiles"][number];

export function StepMedia({
  sessionId,
  files,
  onChange,
}: {
  sessionId: string;
  files: MediaFile[];
  onChange: (files: MediaFile[]) => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoCount = files.filter((f) => f.type === "photo").length;
  const videoCount = files.filter((f) => f.type === "video").length;

  async function handleFiles(type: "photo" | "video", fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const limit = type === "photo" ? MAX_PHOTOS : MAX_VIDEOS;
    const currentCount = type === "photo" ? photoCount : videoCount;
    const incoming = Array.from(fileList);

    if (currentCount + incoming.length > limit) {
      setError(`Puedes subir hasta ${limit} ${type === "photo" ? "fotos" : "videos"}.`);
      return;
    }

    setUploading(true);
    const uploaded: MediaFile[] = [];

    for (const file of incoming) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`"${file.name}" supera los ${MAX_SIZE_MB}MB permitidos.`);
        continue;
      }

      if (!isSupabaseConfigured) {
        uploaded.push({ name: file.name, url: URL.createObjectURL(file), path: `demo/${file.name}`, type });
        continue;
      }

      const supabase = createClient();
      const path = `configurator/${sessionId}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const { error: uploadError } = await supabase.storage.from("experience-media").upload(path, file);

      if (uploadError) {
        setError(`No pudimos subir "${file.name}". Intenta de nuevo.`);
        continue;
      }

      uploaded.push({ name: file.name, url: URL.createObjectURL(file), path, type });
    }

    onChange([...files, ...uploaded]);
    setUploading(false);
  }

  function removeFile(path: string) {
    onChange(files.filter((f) => f.path !== path));
  }

  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">Sube tus recuerdos</h2>
      <p className="mt-2 text-sm text-ink/60">
        Fotos (hasta {MAX_PHOTOS}) y videos (hasta {MAX_VIDEOS}) que aparecerán en la galería y el video de tu experiencia.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          disabled={uploading || photoCount >= MAX_PHOTOS}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borgona-200 bg-borgona-50/40 px-4 py-8 text-borgona-700 transition-colors hover:bg-borgona-50 disabled:opacity-50"
        >
          <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
          <span className="text-sm font-semibold">Subir fotos ({photoCount}/{MAX_PHOTOS})</span>
        </button>
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading || videoCount >= MAX_VIDEOS}
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-dorado-300 bg-dorado-50/50 px-4 py-8 text-dorado-500 transition-colors hover:bg-dorado-50 disabled:opacity-50"
        >
          <Video className="h-7 w-7" strokeWidth={1.5} />
          <span className="text-sm font-semibold">Subir videos ({videoCount}/{MAX_VIDEOS})</span>
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles("photo", e.target.files)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles("video", e.target.files)}
        />
      </div>

      {uploading && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Subiendo archivos...
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rubi-600">{error}</p>}

      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((file) => (
            <div key={file.path} className="group relative aspect-square overflow-hidden rounded-xl border border-ink/10">
              {file.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
              ) : (
                <video src={file.url} className="h-full w-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => removeFile(file.path)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-borgona-800/80 text-blanco opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Quitar ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
