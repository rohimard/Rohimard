import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QrCodeCard } from "@/components/crear/QrCodeCard";
import { IconArrowRight } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Tu experiencia está lista",
};

export default function ExitoPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const slug = searchParams.slug;
  if (!slug) redirect("/crear");

  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <span className="eyebrow">¡Listo!</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Su experiencia digital ya está creada
            </h1>
            <p className="mt-3 text-ink-600">
              Descarga el código QR e imprímelo para colocarlo dentro de la
              caja física.
            </p>
          </div>

          <QrCodeCard slug={slug} />

          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:flex-row">
            <Link href={`/${slug}`} className="btn-secondary flex-1">
              Ver su página
            </Link>
            <Link href="/crear" className="btn-primary flex-1">
              Crear otra
              <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
