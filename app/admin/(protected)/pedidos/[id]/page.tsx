import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, MapPin, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { OCCASIONS } from "@/lib/types";

export const metadata = { title: "Detalle de pedido", robots: { index: false, follow: false } };

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", params.id).maybeSingle();
  if (!order) notFound();

  const { data: delivery } = await supabase
    .from("delivery_addresses")
    .select("*")
    .eq("order_id", order.id)
    .maybeSingle();

  let mediaUrls: { path: string; url: string }[] = [];
  if (isSupabaseAdminConfigured && order.media_paths?.length) {
    const admin = createAdminClient();
    mediaUrls = await Promise.all(
      order.media_paths.map(async (path) => {
        const { data } = await admin.storage.from("experience-media").createSignedUrl(path, 3600);
        return { path, url: data?.signedUrl ?? "" };
      }),
    );
  }

  const occasion = OCCASIONS.find((o) => o.value === order.occasion);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="heading-display text-3xl">{order.order_number}</h1>
          <p className="mt-1 text-sm text-ink/60">
            Creado el {new Date(order.created_at).toLocaleString("es-PE")}
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href={`/admin/experiencias/nueva?order_id=${order.id}`}>
            <Sparkles className="h-4 w-4" /> Crear experiencia QR
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Section title="Historia y mensaje">
            <Field label="Ocasión" value={`${occasion?.emoji ?? ""} ${occasion?.label ?? order.occasion}`} />
            <Field label="Para" value={order.recipient_name ?? "—"} />
            <Field label="De parte de" value={order.sender_name ?? "—"} />
            {order.special_date && <Field label="Fecha especial" value={order.special_date} />}
            <Field label="Mensaje" value={order.message ?? "—"} multiline />
            <Field label="Carta" value={order.letter ?? "—"} multiline />
            <Field label="Frase especial" value={order.special_phrase ?? "—"} />
            <Field
              label="Música"
              value={order.music_option === "sin_musica" ? "Sin música" : `${order.music_option}: ${order.music_value ?? "—"}`}
            />
          </Section>

          {mediaUrls.length > 0 && (
            <Section title="Recuerdos subidos">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {mediaUrls.map((m) => (
                  <a key={m.path} href={m.url} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-xl border border-ink/10">
                    {/\.(mp4|mov|webm)$/i.test(m.path) ? (
                      <video src={m.url} className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="h-full w-full object-cover" />
                    )}
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Estado del pedido">
            <OrderStatusSelect orderId={order.id} status={order.status} />
          </Section>

          <Section title="Cliente">
            <Field icon={<User className="h-3.5 w-3.5" />} label="Nombre" value={order.customer_name} />
            <Field icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={order.customer_phone} />
          </Section>

          {delivery && (
            <Section title="Entrega">
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Distrito" value={delivery.district} />
              <Field label="Dirección" value={delivery.address} />
              {delivery.reference && <Field label="Referencia" value={delivery.reference} />}
              <Field label="Fecha" value={delivery.delivery_date ?? "Por coordinar"} />
              <Field label="Horario" value={delivery.delivery_time ?? "Por coordinar"} />
            </Section>
          )}

          <Section title="Pago">
            <Field label="Subtotal" value={formatCurrency(Number(order.subtotal))} />
            <Field label="Delivery" value={formatCurrency(Number(order.delivery_cost))} />
            <Field label="Total" value={formatCurrency(Number(order.total))} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-premium p-6">
      <h2 className="heading-display text-lg">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, icon, multiline }: { label: string; value: string; icon?: React.ReactNode; multiline?: boolean }) {
  return (
    <div className="text-sm">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink/40">
        {icon} {label}
      </p>
      <p className={`mt-1 text-ink/80 ${multiline ? "whitespace-pre-line" : ""}`}>{value}</p>
    </div>
  );
}
