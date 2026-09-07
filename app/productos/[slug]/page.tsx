import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { PRODUCT_LINES, getProductBySlug } from "@/lib/data/products";
import { formatCurrencyCompact } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";
import { siteConfig } from "@/lib/config/site";

export function generateStaticParams() {
  return PRODUCT_LINES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.slug}` },
  };
}

export default function ProductoDetailPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: siteConfig.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: product.priceFrom,
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/productos/${product.slug}`,
    },
  };

  return (
    <section className="bg-blanco py-16 lg:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-momentia grid gap-12 lg:grid-cols-2 lg:items-start">
        <Reveal>
          <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-rubi-500 via-borgona-600 to-borgona-800 shadow-card">
            <span className="font-script text-4xl text-crema-50">{product.phrase}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <span className="eyebrow">{product.eyebrow}</span>
          <h1 className="heading-display mt-2 text-4xl">{product.name}</h1>
          <p className="mt-3 font-script text-2xl text-dorado-500">{product.phrase}</p>
          <p className="mt-5 text-base leading-relaxed text-ink/70">{product.description}</p>

          <p className="mt-6 text-sm text-ink/50">Desde</p>
          <p className="heading-display text-4xl text-borgona-700">{formatCurrencyCompact(product.priceFrom)}</p>

          <FloralDivider className="my-7 justify-start [&>span:first-child]:hidden" />

          <h2 className="text-sm font-semibold uppercase tracking-wide text-borgona-700">Incluye</h2>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {product.includes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-ink/75">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-borgona-600" /> {item}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/crear?producto=${product.slug}`}>
                Personalizar este regalo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/productos">Ver otras líneas</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
