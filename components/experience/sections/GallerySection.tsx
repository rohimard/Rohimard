"use client";

import { Camera } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import type { ExperienceMediaItem } from "@/lib/types/experience";

export function GallerySection({ photos }: { photos: ExperienceMediaItem[] }) {
  return (
    <section className="min-h-screen px-6 py-24 text-crema-50">
      <Reveal className="text-center">
        <span className="eyebrow !text-dorado-200">Galería de fotos</span>
        <h2 className="heading-display mt-3 text-2xl text-blanco sm:text-3xl">Momentos que guardamos</h2>
      </Reveal>

      <StaggerGroup className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-2">
        {photos.map((photo) => (
          <StaggerItem key={photo.id}>
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-dorado-200/30 shadow-card">
              {photo.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={photo.caption ?? ""} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-rubi-500/70 via-borgona-600/80 to-borgona-800 text-crema-100/80">
                  <Camera className="h-7 w-7" strokeWidth={1.4} />
                </div>
              )}
              {photo.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-borgona-900/80 to-transparent px-3 py-3 text-left text-xs text-crema-50">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
