"use client";

import { useState } from "react";

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="aspect-square overflow-hidden rounded-xl"
          >
            <img
              src={src}
              alt=""
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/90 p-4"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[active]}
            alt=""
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </>
  );
}
