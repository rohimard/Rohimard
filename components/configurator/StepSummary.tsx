"use client";

import { Heart } from "lucide-react";
import { getProductBySlug } from "@/lib/data/products";
import { getDeliveryCost } from "@/lib/data/delivery";
import { formatCurrency } from "@/lib/utils/currency";
import { OCCASIONS } from "@/lib/types";
import type { ConfiguratorState } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function StepSummary({
  state,
  submitting,
  onSubmit,
}: {
  state: ConfiguratorState;
  submitting: boolean;
  onSubmit: () => void;
}) {
  const product = state.productSlug ? getProductBySlug(state.productSlug) : undefined;
  const occasion = OCCASIONS.find((o) => o.value === state.occasion);
  const subtotal = product?.priceFrom ?? 0;
  const deliveryCost = state.delivery.district ? getDeliveryCost(state.delivery.district, subtotal) : 0;
  const total = subtotal + deliveryCost;

  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">Resumen de tu Momentia</h2>
      <p className="mt-2 text-sm text-ink/60">Revisa todo antes de confirmar. Podrás volver a cualquier paso.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-dorado-200/60 bg-crema-50/50 p-6">
          <SummaryRow label="Ocasión" value={`${occasion?.emoji ?? ""} ${occasion?.label ?? "—"}`} />
          <SummaryRow label="Experiencia" value={product?.name ?? "—"} />
          <SummaryRow label="Para" value={state.recipientName || "—"} />
          <SummaryRow label="De parte de" value={state.senderName || "—"} />
          {state.specialDate && <SummaryRow label="Fecha especial" value={state.specialDate} />}
          <SummaryRow label="Recuerdos" value={`${state.mediaFiles.length} archivo(s)`} />
          <SummaryRow
            label="Música"
            value={state.musicOption === "sin_musica" ? "Sin música" : state.musicValue || "—"}
          />
          <Separator />
          <SummaryRow label="Entrega" value={`${state.delivery.district || "—"} · ${state.delivery.deliveryDate || "por coordinar"}`} />
          <SummaryRow label="Dirección" value={state.delivery.address || "—"} />
        </div>

        <div className="h-fit rounded-2xl border border-borgona-200 bg-blanco p-6 shadow-soft">
          <h3 className="heading-display text-lg">Total a pagar</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>{product?.name ?? "Producto"}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery</span>
              <span>{deliveryCost === 0 ? "Gratis" : formatCurrency(deliveryCost)}</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-semibold text-borgona-700">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Button className="mt-6 w-full" size="lg" onClick={onSubmit} disabled={submitting}>
            <Heart className="h-4 w-4" /> {submitting ? "Creando tu Momentia..." : "Crear mi Momentia"}
          </Button>
          <p className="mt-3 text-center text-xs text-ink/50">
            Pago por Yape, Plin o transferencia. Te contactaremos para confirmar.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-ink/50">{label}</span>
      <span className="text-right font-medium text-ink/80">{value}</span>
    </div>
  );
}
