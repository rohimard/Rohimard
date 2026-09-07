"use client";

import { useState } from "react";
import Link from "next/link";
import type { Experience } from "@/lib/types";
import { toEmbedSpotifyUrl, toEmbedVideoUrl } from "@/lib/format";
import { EnvelopeReveal } from "./EnvelopeReveal";
import { PhotoGallery } from "./PhotoGallery";
import { IconArrowRight, IconMail } from "@/components/ui/icons";

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-maroon-100/70 py-14">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="mt-4 font-serif text-2xl font-bold text-ink-900 sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

export function ExperienceView({ experience }: { experience: Experience }) {
  const [letterOpen, setLetterOpen] = useState(false);
  const embedVideo = experience.videoUrl
    ? toEmbedVideoUrl(experience.videoUrl)
    : null;
  const embedPlaylist = experience.playlistUrl
    ? toEmbedSpotifyUrl(experience.playlistUrl)
    : null;

  return (
    <div className="flex min-h-dvh flex-col bg-cream-50">
      {/* Portada */}
      <section className="relative overflow-hidden bg-maroon-700 py-20 text-center text-cream-50">
        <div className="bg-damask pointer-events-none absolute inset-0 opacity-10" aria-hidden />
        <div className="container-page relative">
          <span className="grid mx-auto h-12 w-12 place-items-center rounded-full border border-gold-400 font-serif text-lg font-bold text-gold-400">
            M
          </span>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-gold-300">
            Un momento hecho para ti
          </p>
          <h1 className="script-accent mt-3 text-5xl text-cream-50 sm:text-6xl">
            {experience.recipientName}
          </h1>
          <p className="mt-3 text-sm text-cream-100/80">
            De parte de {experience.senderName}
          </p>
        </div>
      </section>

      <main className="flex-1">
        <Section eyebrow="Mensaje personalizado" title="Un mensaje para ti">
          <EnvelopeReveal
            recipientName={experience.recipientName}
            message={experience.message}
          />
        </Section>

        {experience.photos.length > 0 && (
          <Section eyebrow="Galería de fotos" title="Nuestra historia en imágenes">
            <PhotoGallery photos={experience.photos} />
          </Section>
        )}

        {embedVideo && (
          <Section eyebrow="Video especial" title="Un video para ti">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-ink-900 shadow-card">
              <iframe
                src={embedVideo}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Section>
        )}

        {embedPlaylist && (
          <Section eyebrow="Playlist personalizada" title="Nuestra canción">
            <div className="overflow-hidden rounded-2xl bg-ink-900 shadow-card">
              <iframe
                src={embedPlaylist}
                className="w-full border-0"
                height={352}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </Section>
        )}

        {experience.letter && (
          <Section eyebrow="Carta digital" title="Una carta para ti">
            <div className="card mx-auto max-w-lg p-7 text-center">
              {!letterOpen ? (
                <button
                  type="button"
                  onClick={() => setLetterOpen(true)}
                  className="flex flex-col items-center gap-3"
                >
                  <IconMail width={32} height={32} className="text-maroon-500" />
                  <span className="text-sm font-semibold text-maroon-700">
                    Leer carta completa
                  </span>
                </button>
              ) : (
                <p className="whitespace-pre-line text-left text-[15px] leading-relaxed text-ink-800">
                  {experience.letter}
                </p>
              )}
            </div>
          </Section>
        )}

        <section className="border-t border-maroon-100/70 bg-maroon-50/50 py-14 text-center">
          <div className="container-page">
            <p className="text-sm text-ink-600">
              Creado con amor en{" "}
              <span className="font-semibold text-maroon-700">Momentia</span>
            </p>
            <Link href="/crear" className="btn-primary mt-4">
              Crea tu propio regalo
              <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
