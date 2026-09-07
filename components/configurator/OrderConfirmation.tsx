import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/currency";
import { FloralDivider } from "@/components/decorative/Ornaments";
import type { CreateOrderResult } from "@/lib/actions/orders";

export function OrderConfirmation({ result }: { result: CreateOrderResult }) {
  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-borgona-50 text-borgona-600">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
      </div>

      <h2 className="heading-display mt-6 text-3xl">¡Tu Momentia está en camino!</h2>
      <p className="mt-3 text-ink/65">
        Recibimos tu pedido <span className="font-semibold text-borgona-700">{result.orderNumber}</span> por un total de{" "}
        <span className="font-semibold text-borgona-700">{result.total ? formatCurrency(result.total) : ""}</span>.
      </p>

      <FloralDivider className="my-6" />

      <div className="rounded-2xl border border-dorado-200/60 bg-crema-50/60 p-6 text-left text-sm text-ink/70">
        <p className="font-semibold text-borgona-700">Siguiente paso: confirmar el pago</p>
        <p className="mt-2">
          Escríbenos por WhatsApp para coordinar tu pago por Yape, Plin o transferencia bancaria y
          enviarnos tu comprobante. Un miembro de nuestro equipo validará tu pedido manualmente.
        </p>
        {result.demo && (
          <p className="mt-3 rounded-lg bg-dorado-50 px-3 py-2 text-xs text-dorado-500">
            Modo demo: Supabase no está configurado todavía, así que este pedido no se guardó en
            una base de datos real.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Confirmar por WhatsApp
          </a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
