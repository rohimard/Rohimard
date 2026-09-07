import type { Metadata } from "next";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CrearExperienciaForm } from "@/components/crear/CrearExperienciaForm";
import { BOX_LINES, type BoxLine } from "@/lib/types";

export const metadata: Metadata = {
  title: "Crear mi regalo",
  description:
    "Personaliza tu caja Momentia: sube fotos, un video, tu playlist y escribe un mensaje. Generamos el QR para imprimir dentro de la caja.",
};

function resolveLine(value?: string): BoxLine {
  return value && value in BOX_LINES ? (value as BoxLine) : "esencial";
}

export default function CrearPage({
  searchParams,
}: {
  searchParams: { linea?: string };
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1 py-14">
        <div className="container-page">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow">Crear mi regalo</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Arma la experiencia digital de tu caja
            </h1>
            <p className="mt-3 text-ink-600">
              Al terminar, te daremos el código QR listo para imprimir y
              colocar dentro del regalo físico.
            </p>
          </div>

          <CrearExperienciaForm initialLine={resolveLine(searchParams.linea)} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
