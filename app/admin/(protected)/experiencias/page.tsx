import Link from "next/link";
import { Plus, Eye, Lock, Clock, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Experiencias", robots: { index: false, follow: false } };

const PRIVACY_ICON = { public: Globe, private: Lock, temporal: Clock } as const;

export default async function AdminExperiencesPage() {
  if (!isSupabaseConfigured) {
    return <div className="card-premium p-8 text-center text-ink/60">Configura Supabase para gestionar experiencias.</div>;
  }

  const supabase = createClient();
  const { data: experiences } = await supabase
    .from("digital_experiences")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-3xl">Experiencias digitales</h1>
          <p className="mt-1 text-sm text-ink/60">El corazón de MOMENTIA: lo que hay detrás de cada QR.</p>
        </div>
        <Button asChild>
          <Link href="/admin/experiencias/nueva">
            <Plus className="h-4 w-4" /> Nueva experiencia
          </Link>
        </Button>
      </div>

      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Para</th>
              <th className="px-6 py-3">Privacidad</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Vistas</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {(!experiences || experiences.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-ink/40">
                  Todavía no hay experiencias creadas.
                </td>
              </tr>
            )}
            {experiences?.map((exp) => {
              const PrivacyIcon = PRIVACY_ICON[exp.privacy];
              return (
                <tr key={exp.id} className="border-b border-ink/5 last:border-0 hover:bg-crema-50/60">
                  <td className="px-6 py-3">
                    <Link href={`/admin/experiencias/${exp.id}`} className="font-semibold text-borgona-700">
                      /{exp.slug}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-ink/70">{exp.recipient_name}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink/60">
                      <PrivacyIcon className="h-3.5 w-3.5" /> {exp.privacy}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Badge variant={exp.status === "publicada" ? "success" : "outline"}>{exp.status}</Badge>
                  </td>
                  <td className="px-6 py-3 text-ink/60">{exp.view_count}</td>
                  <td className="px-6 py-3 text-right">
                    <a
                      href={`/m/${exp.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-borgona-700"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
