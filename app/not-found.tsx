import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloralDivider } from "@/components/decorative/Ornaments";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-crema-50 px-6 text-center">
      <span className="font-script text-3xl text-dorado-500">Hay cosas que no encontramos...</span>
      <h1 className="heading-display mt-4 text-4xl sm:text-5xl">404</h1>
      <FloralDivider className="my-6" />
      <p className="max-w-sm text-sm text-ink/60">
        La página que buscas no existe o el momento que buscabas ya cambió de dirección.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </section>
  );
}
