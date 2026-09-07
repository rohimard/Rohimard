"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Experience } from "@/lib/types";
import { getDemoExperience } from "@/lib/demo-store";
import { ExperienceView } from "./ExperienceView";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export function LocalExperienceLookup({ slug }: { slug: string }) {
  const [experience, setExperience] = useState<Experience | null | undefined>(
    undefined,
  );

  useEffect(() => {
    setExperience(getDemoExperience(slug));
  }, [slug]);

  if (experience === undefined) return null;

  if (experience) return <ExperienceView experience={experience} />;

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="grid flex-1 place-items-center px-6 py-20 text-center">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            Aún no existe esta experiencia
          </h1>
          <p className="mt-2 text-ink-600">
            No encontramos <span className="font-medium">/{slug}</span> en
            este navegador. Si acabas de crearla, ábrela desde el mismo
            dispositivo donde la creaste.
          </p>
          <Link href="/crear" className="btn-primary mt-6">
            Crear un regalo personalizado
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
