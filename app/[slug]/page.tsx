import type { Metadata } from "next";
import { getExperienceBySlug } from "@/lib/actions/experiences";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ExperienceView } from "@/components/experiencia/ExperienceView";
import { LocalExperienceLookup } from "@/components/experiencia/LocalExperienceLookup";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const experience = await getExperienceBySlug(params.slug);
  if (!experience) return { title: "Un momento para ti" };
  return {
    title: `Para ${experience.recipientName}`,
    description: `${experience.senderName} tiene un momento especial para ti.`,
  };
}

export default async function ExperienciaPage({
  params,
}: {
  params: { slug: string };
}) {
  const experience = await getExperienceBySlug(params.slug);

  if (experience) {
    return <ExperienceView experience={experience} />;
  }

  if (isSupabaseConfigured) {
    notFound();
  }

  return <LocalExperienceLookup slug={params.slug} />;
}
