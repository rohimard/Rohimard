"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_DELIVERY_ZONES } from "@/lib/data/delivery";
import type { ConfiguratorState } from "@/lib/types";

type Delivery = ConfiguratorState["delivery"];

export function StepDelivery({
  values,
  onChange,
}: {
  values: Delivery;
  onChange: <K extends keyof Delivery>(key: K, value: Delivery[K]) => void;
}) {
  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">Datos de entrega</h2>
      <p className="mt-2 text-sm text-ink/60">Coordinamos la entrega en Lima, Callao y todo el Perú.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contactName">Nombre de contacto</Label>
          <Input id="contactName" value={values.contactName} onChange={(e) => onChange("contactName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" type="tel" placeholder="9XX XXX XXX" value={values.phone} onChange={(e) => onChange("phone", e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Distrito</Label>
          <Select value={values.district} onValueChange={(v) => onChange("district", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona tu distrito" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_DELIVERY_ZONES.map((zone) => (
                <SelectItem key={zone.district} value={zone.district}>
                  {zone.district} — S/ {zone.cost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Dirección</Label>
          <Input id="address" value={values.address} onChange={(e) => onChange("address", e.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="reference">Referencia (opcional)</Label>
          <Textarea
            id="reference"
            className="min-h-[80px]"
            placeholder="Ej. Edificio azul, tocar el timbre 2B"
            value={values.reference}
            onChange={(e) => onChange("reference", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Fecha de entrega</Label>
          <Input id="deliveryDate" type="date" value={values.deliveryDate} onChange={(e) => onChange("deliveryDate", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryTime">Horario aproximado</Label>
          <Input
            id="deliveryTime"
            placeholder="Ej. 3:00 pm - 6:00 pm"
            value={values.deliveryTime}
            onChange={(e) => onChange("deliveryTime", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
