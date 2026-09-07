"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BOX_LINES, type BoxLine } from "@/lib/types";
import { formatSoles } from "@/lib/format";
import { isValidSlug, slugify } from "@/lib/slug";
import { resizeImageFile } from "@/lib/image";
import {
  generateEditToken,
  isDemoSlugTaken,
  saveDemoExperience,
} from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createExperience, isSlugAvailable } from "@/lib/actions/experiences";
import { IconArrowRight, IconUpload } from "@/components/ui/icons";

const MAX_PHOTOS = 6;

const STEPS = ["Línea", "Destinatario", "Contenido", "Revisión"] as const;

export function CrearExperienciaForm({
  initialLine,
}: {
  initialLine: BoxLine;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [boxLine, setBoxLine] = useState<BoxLine>(initialLine);
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [message, setMessage] = useState("");
  const [letter, setLetter] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(recipientName));
  }, [recipientName, slugTouched]);

  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    if (!isValidSlug(slug)) {
      setSlugStatus("invalid");
      return;
    }
    setSlugStatus("checking");
    const timeout = setTimeout(async () => {
      const takenLocally = !isSupabaseConfigured && isDemoSlugTaken(slug);
      const available = takenLocally ? false : await isSlugAvailable(slug);
      setSlugStatus(available ? "available" : "taken");
    }, 400);
    return () => clearTimeout(timeout);
  }, [slug]);

  async function handlePhotoUpload(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const resized = await Promise.all(
      toProcess.map((f) => resizeImageFile(f)),
    );
    setPhotos((prev) => [...prev, ...resized]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(boxLine);
    if (step === 1)
      return (
        senderName.trim().length > 1 &&
        recipientName.trim().length > 1 &&
        slugStatus === "available"
      );
    if (step === 2) return message.trim().length > 3;
    return true;
  }, [step, boxLine, senderName, recipientName, slugStatus, message]);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      let finalPhotos = photos;

      if (isSupabaseConfigured && photos.length > 0) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const uploaded: string[] = [];
          for (let i = 0; i < photos.length; i++) {
            const blob = await (await fetch(photos[i])).blob();
            const path = `${slug}/${Date.now()}-${i}.jpg`;
            const { error } = await supabase.storage
              .from("experiencias")
              .upload(path, blob, { contentType: "image/jpeg" });
            if (!error) {
              const { data } = supabase.storage
                .from("experiencias")
                .getPublicUrl(path);
              uploaded.push(data.publicUrl);
            }
          }
          finalPhotos = uploaded;
        }
      }

      const input = {
        slug,
        boxLine,
        senderName: senderName.trim(),
        recipientName: recipientName.trim(),
        message: message.trim(),
        letter: letter.trim(),
        photos: finalPhotos,
        videoUrl: videoUrl.trim() || null,
        playlistUrl: playlistUrl.trim() || null,
      };

      const result = await createExperience(input);

      if (!result.ok) {
        setSubmitError(
          result.error === "slug_taken"
            ? "Ese enlace ya está en uso, elige otro nombre."
            : "No pudimos guardar tu experiencia. Intenta nuevamente.",
        );
        setSubmitting(false);
        return;
      }

      if (!isSupabaseConfigured) {
        saveDemoExperience({
          ...input,
          createdAt: new Date().toISOString(),
          editToken: generateEditToken(),
        });
      }

      router.push(`/crear/exito?slug=${slug}`);
    } catch {
      setSubmitError("Ocurrió un error inesperado. Intenta nuevamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Indicador de pasos */}
      <ol className="mb-10 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                  i <= step
                    ? "bg-maroon-600 text-cream-50"
                    : "border border-ink-200 text-ink-400"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  i <= step ? "text-maroon-700" : "text-ink-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 mt-[-1.1rem] h-px flex-1 ${
                  i < step ? "bg-maroon-400" : "bg-ink-200"
                }`}
              />
            )}
          </li>
        ))}
      </ol>

      <div className="card p-6 sm:p-8">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-semibold text-ink-900">
              Elige la caja que vas a personalizar
            </h2>
            <div className="mt-5 space-y-3">
              {(Object.keys(BOX_LINES) as BoxLine[]).map((key) => {
                const line = BOX_LINES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBoxLine(key)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                      boxLine === key
                        ? "border-maroon-500 bg-maroon-50"
                        : "border-ink-200 hover:border-maroon-200"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-ink-900">
                        {line.name}
                      </p>
                      <p className="text-sm text-ink-500">{line.tagline}</p>
                    </div>
                    <p className="font-semibold text-maroon-700">
                      {formatSoles(line.priceFrom)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-ink-900">
              ¿Para quién es este regalo?
            </h2>
            <div>
              <label className="input-label">Tu nombre (remitente)</label>
              <input
                className="input"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ej. Carlos"
              />
            </div>
            <div>
              <label className="input-label">Nombre del destinatario</label>
              <input
                className="input"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ej. Ana"
              />
            </div>
            <div>
              <label className="input-label">Enlace de su experiencia</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-ink-200 bg-white focus-within:border-maroon-500 focus-within:ring-4 focus-within:ring-maroon-500/10">
                <span className="whitespace-nowrap bg-ink-50 px-3 py-2.5 text-sm text-ink-500">
                  momentia.pe/
                </span>
                <input
                  className="w-full border-0 bg-transparent px-1 py-2.5 text-[15px] focus:outline-none"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs">
                {slugStatus === "checking" && (
                  <span className="text-ink-500">Comprobando disponibilidad…</span>
                )}
                {slugStatus === "available" && (
                  <span className="text-emerald-600">Disponible ✓</span>
                )}
                {slugStatus === "taken" && (
                  <span className="text-rose-600">
                    Ese enlace ya está en uso, prueba otro.
                  </span>
                )}
                {slugStatus === "invalid" && (
                  <span className="text-rose-600">
                    Usa solo letras, números y guiones (mín. 2 caracteres).
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-ink-900">
              Cuéntanos su historia
            </h2>
            <div>
              <label className="input-label">
                Mensaje corto (aparece primero)
              </label>
              <textarea
                className="input min-h-20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hay momentos que se convierten en recuerdos…"
              />
            </div>
            <div>
              <label className="input-label">Carta digital (opcional)</label>
              <textarea
                className="input min-h-32"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                placeholder="Escribe una carta completa para esta persona."
              />
            </div>
            <div>
              <label className="input-label">
                Fotos (hasta {MAX_PHOTOS})
              </label>
              <div className="flex flex-wrap gap-3">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div key={i} className="group relative h-20 w-20">
                    <img
                      src={src}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-maroon-600 text-[10px] text-cream-50"
                      aria-label="Quitar foto"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-ink-300 text-ink-400 hover:border-maroon-400 hover:text-maroon-500"
                  >
                    <IconUpload width={22} height={22} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </div>
            </div>
            <div>
              <label className="input-label">
                Enlace de video (YouTube o Vimeo, opcional)
              </label>
              <input
                className="input"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="input-label">
                Enlace de playlist (Spotify, opcional)
              </label>
              <input
                className="input"
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold text-ink-900">
              Revisa antes de crear su experiencia
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-ink-100 pb-2">
                <dt className="text-ink-500">Caja</dt>
                <dd className="font-medium text-ink-900">
                  {BOX_LINES[boxLine].name}
                </dd>
              </div>
              <div className="flex justify-between border-b border-ink-100 pb-2">
                <dt className="text-ink-500">Para</dt>
                <dd className="font-medium text-ink-900">{recipientName}</dd>
              </div>
              <div className="flex justify-between border-b border-ink-100 pb-2">
                <dt className="text-ink-500">De</dt>
                <dd className="font-medium text-ink-900">{senderName}</dd>
              </div>
              <div className="flex justify-between border-b border-ink-100 pb-2">
                <dt className="text-ink-500">Su enlace</dt>
                <dd className="font-medium text-maroon-700">
                  momentia.pe/{slug}
                </dd>
              </div>
              <div className="flex justify-between border-b border-ink-100 pb-2">
                <dt className="text-ink-500">Fotos</dt>
                <dd className="font-medium text-ink-900">
                  {photos.length}
                </dd>
              </div>
            </dl>
            {!isSupabaseConfigured && (
              <p className="rounded-lg bg-gold-300/30 p-3 text-xs text-ink-700">
                Modo demo: esta experiencia se guardará en este navegador.
                Configura Supabase para que quede disponible para cualquiera
                que escanee el QR.
              </p>
            )}
            {submitError && (
              <p className="text-sm text-rose-600">{submitError}</p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={`btn-ghost ${step === 0 ? "invisible" : ""}`}
          >
            Atrás
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary"
            >
              Continuar
              <IconArrowRight width={16} height={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="btn-primary"
            >
              {submitting ? "Creando…" : "Crear mi experiencia digital"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
