"use client";

import { Check } from "lucide-react";
import { PRODUCT_LINES } from "@/lib/data/products";
import type { ProductSlug } from "@/lib/types";
import { formatCurrencyCompact } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";

export function StepExperience({
  value,
  onChange,
}: {
  value: ProductSlug | null;
  onChange: (v: ProductSlug) => void;
}) {
  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">Elige tu experiencia</h2>
      <p className="mt-2 text-sm text-ink/60">Cada línea incluye su propia experiencia digital por QR.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {PRODUCT_LINES.map((product) => (
          <button
            key={product.slug}
            type="button"
            onClick={() => onChange(product.slug)}
            className={cn(
              "relative flex flex-col rounded-2xl border-2 bg-blanco p-6 text-left transition-all",
              value === product.slug
                ? "border-borgona-500 shadow-soft"
                : "border-ink/10 hover:border-borgona-200",
            )}
          >
            {value === product.slug && (
              <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-borgona-600 text-blanco">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="eyebrow">{product.eyebrow}</span>
            <h3 className="heading-display mt-1.5 text-xl">{product.name}</h3>
            <p className="mt-1.5 font-script text-xl text-dorado-500">{product.phrase}</p>
            <p className="mt-3 text-sm text-ink/50">Desde</p>
            <p className="heading-display text-2xl text-borgona-700">{formatCurrencyCompact(product.priceFrom)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
