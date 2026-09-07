import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DeliverySettingsForm, LaunchCampaignSettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_DELIVERY_ZONES, FREE_DELIVERY_ABOVE } from "@/lib/data/delivery";
import { siteConfig } from "@/lib/config/site";

export const metadata = { title: "Configuración", robots: { index: false, follow: false } };

export default async function AdminSettingsPage() {
  let deliveryValue: { zones: typeof DEFAULT_DELIVERY_ZONES; freeAbove: number } = {
    zones: DEFAULT_DELIVERY_ZONES,
    freeAbove: FREE_DELIVERY_ABOVE,
  };
  let campaignValue = { active: true, slotsLeft: 20 };

  if (isSupabaseConfigured) {
    const supabase = createClient();
    const { data: settings } = await supabase.from("settings").select("*").in("key", ["delivery", "launch_campaign"]);
    const delivery = settings?.find((s) => s.key === "delivery")?.value as typeof deliveryValue | undefined;
    const campaign = settings?.find((s) => s.key === "launch_campaign")?.value as typeof campaignValue | undefined;
    if (delivery) deliveryValue = delivery;
    if (campaign) campaignValue = campaign;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl">Configuración</h1>
        <p className="mt-1 text-sm text-ink/60">Delivery, campaña de lanzamiento y datos de contacto.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="card-premium p-6 text-sm text-ink/60">
          Estás en modo demo. Los cambios no se guardarán hasta configurar Supabase.
        </div>
      )}

      <DeliverySettingsForm zones={deliveryValue.zones} freeAbove={deliveryValue.freeAbove} />
      <LaunchCampaignSettingsForm active={campaignValue.active} slotsLeft={campaignValue.slotsLeft} />

      <div className="card-premium p-6">
        <h3 className="heading-display text-lg">Contacto y redes</h3>
        <p className="mt-2 text-sm text-ink/60">
          Estos valores se configuran por variables de entorno (ver <code className="rounded bg-crema-100 px-1.5 py-0.5">.env.local.example</code>):
        </p>
        <ul className="mt-3 space-y-1.5 text-sm text-ink/70">
          <li>WhatsApp: +{siteConfig.whatsapp.number}</li>
          <li>Instagram: {siteConfig.social.instagramHandle}</li>
          <li>Correo: {siteConfig.email}</li>
        </ul>
      </div>
    </div>
  );
}
