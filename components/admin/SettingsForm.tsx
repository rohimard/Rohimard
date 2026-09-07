"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateSetting } from "@/lib/actions/admin-settings";
import type { DeliveryZone } from "@/lib/data/delivery";

export function DeliverySettingsForm({ zones: initialZones, freeAbove: initialFreeAbove }: { zones: DeliveryZone[]; freeAbove: number }) {
  const [zones, setZones] = useState(initialZones);
  const [freeAbove, setFreeAbove] = useState(initialFreeAbove);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateZone(index: number, field: keyof DeliveryZone, value: string) {
    setZones((z) => z.map((zone, i) => (i === index ? { ...zone, [field]: field === "cost" ? Number(value) : value } : zone)));
  }

  async function handleSave() {
    setSaving(true);
    await updateSetting("delivery", { zones, freeAbove });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card-premium space-y-4 p-6">
      <h3 className="heading-display text-lg">Delivery</h3>
      {zones.map((zone, i) => (
        <div key={i} className="flex items-center gap-3">
          <Input value={zone.district} onChange={(e) => updateZone(i, "district", e.target.value)} className="flex-1" />
          <Input
            type="number"
            value={zone.cost}
            onChange={(e) => updateZone(i, "cost", e.target.value)}
            className="w-24"
          />
          <button
            type="button"
            onClick={() => setZones((z) => z.filter((_, idx) => idx !== i))}
            className="text-ink/40 hover:text-rubi-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setZones((z) => [...z, { district: "Nuevo distrito", cost: 15 }])}
        className="flex items-center gap-1.5 text-sm font-semibold text-borgona-700"
      >
        <Plus className="h-3.5 w-3.5" /> Agregar zona
      </button>

      <div className="space-y-2 pt-2">
        <Label htmlFor="freeAbove">Delivery gratis desde (S/)</Label>
        <Input id="freeAbove" type="number" value={freeAbove} onChange={(e) => setFreeAbove(Number(e.target.value))} className="w-40" />
      </div>

      <Button onClick={handleSave} disabled={saving} variant="secondary">
        <Save className="h-4 w-4" /> {saved ? "Guardado" : saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}

export function LaunchCampaignSettingsForm({
  active: initialActive,
  slotsLeft: initialSlotsLeft,
}: {
  active: boolean;
  slotsLeft: number;
}) {
  const [active, setActive] = useState(initialActive);
  const [slotsLeft, setSlotsLeft] = useState(initialSlotsLeft);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await updateSetting("launch_campaign", {
      active,
      slotsLeft,
      title: "LOS PRIMEROS 20 MOMENTIA",
      message: "Estamos creando algo diferente. Y queremos que seas de los primeros en vivirlo.",
      offer: "Las primeras experiencias incluyen un detalle digital especial.",
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card-premium space-y-4 p-6">
      <h3 className="heading-display text-lg">Campaña de lanzamiento</h3>
      <div className="flex items-center gap-3">
        <Switch checked={active} onCheckedChange={setActive} />
        <span className="text-sm text-ink/70">Campaña activa</span>
      </div>
      <div className="space-y-2">
        <Label htmlFor="slotsLeft">Cupos restantes</Label>
        <Input id="slotsLeft" type="number" className="w-32" value={slotsLeft} onChange={(e) => setSlotsLeft(Number(e.target.value))} />
      </div>
      <Button onClick={handleSave} disabled={saving} variant="secondary">
        <Save className="h-4 w-4" /> {saved ? "Guardado" : saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
