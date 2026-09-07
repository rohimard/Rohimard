import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PRODUCT_LINES } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { formatCurrencyCompact } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

const ACCENT_MAP = {
  rubi: { ring: "ring-rubi-200", text: "text-rubi-600", bg: "bg-rubi-50" },
  borgona: { ring: "ring-borgona-300", text: "text-borgona-700", bg: "bg-borgona-50" },
  dorado: { ring: "ring-dorado-200", text: "text-dorado-500", bg: "bg-dorado-50" },
} as const;

export function FeaturedProducts() {
  return (
    <section className="bg-blanco py-20 lg:py-28">
      <div className="container-momentia">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow">Nuestras líneas</span>
          <h2 className="heading-display mt-3 text-balance text-3xl sm:text-4xl">
            Tres formas de decir lo que sientes
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-6 lg:grid-cols-3">
          {PRODUCT_LINES.map((product) => {
            const accent = ACCENT_MAP[product.accent];
            return (
              <StaggerItem key={product.slug}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border bg-blanco p-8 shadow-card transition-transform duration-300 hover:-translate-y-1.5",
                    product.featured ? "border-dorado-300 ring-2 ring-dorado-200" : "border-dorado-100/60",
                  )}
                >
                  {product.featured && (
                    <Badge variant="gold" className="absolute -top-3 left-8">
                      ✨ Producto estrella
                    </Badge>
                  )}

                  <span className={cn("eyebrow", accent.text)}>{product.eyebrow}</span>
                  <h3 className="heading-display mt-2 text-2xl">{product.name}</h3>
                  <p className="mt-2 font-script text-2xl text-dorado-500">{product.phrase}</p>
                  <p className="mt-4 text-sm leading-relaxed text-ink/65">{product.description}</p>

                  <p className="mt-6 text-sm text-ink/50">Desde</p>
                  <p className="heading-display text-3xl text-borgona-700">
                    {formatCurrencyCompact(product.priceFrom)}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {product.includes.slice(0, 6).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink/75">
                        <Check className={cn("mt-0.5 h-4 w-4 shrink-0", accent.text)} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-2.5">
                    <Button asChild variant={product.featured ? "primary" : "secondary"}>
                      <Link href={`/crear?producto=${product.slug}`}>
                        Personalizar <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/productos/${product.slug}`}>Ver detalles</Link>
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
