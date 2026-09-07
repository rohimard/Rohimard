import type { Metadata } from "next";
import { Heart, Clock } from "lucide-react";
import { resolveExperience } from "@/lib/actions/experience";
import { ExperienceClient } from "@/components/experience/ExperienceClient";
import { PinGatedExperience } from "@/components/experience/PinGatedExperience";

export const metadata: Metadata = {
  title: "Una experiencia MOMENTIA para ti",
  description: "Alguien creó un momento especial para ti. Descúbrelo.",
  robots: { index: false, follow: false },
};

export default async function ExperiencePage({ params }: { params: { slug: string } }) {
  const result = await resolveExperience(params.slug);

  if (result.status === "not_found") {
    return <StatusScreen title="Esta experiencia no existe" text="Verifica el enlace o el código QR que escaneaste." />;
  }

  if (result.status === "expired") {
    return (
      <StatusScreen
        icon={<Clock className="h-7 w-7" />}
        title="Esta experiencia ya expiró"
        text="El tiempo para revivir este momento ha llegado a su fin."
      />
    );
  }

  if (result.status === "needs_pin") {
    return <PinGatedExperience slug={params.slug} />;
  }

  return <ExperienceClient data={result.data} />;
}

function StatusScreen({ title, text, icon }: { title: string; text: string; icon?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-borgona-800 to-borgona-600 px-6 text-center text-crema-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dorado-300/20 text-dorado-200">
        {icon ?? <Heart className="h-6 w-6" />}
      </div>
      <h1 className="heading-display mt-5 text-2xl text-blanco">{title}</h1>
      <p className="mt-2 max-w-xs text-sm text-crema-100/80">{text}</p>
    </div>
  );
}
