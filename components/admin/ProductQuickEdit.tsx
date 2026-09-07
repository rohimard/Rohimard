"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { updateProduct } from "@/lib/actions/admin-products";
import type { ProductRow } from "@/lib/types/database";

export function ProductQuickEdit({ product }: { product: ProductRow }) {
  const [priceFrom, setPriceFrom] = useState(product.price_from);
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateProduct(product.id, { priceFrom, active, featured });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="px-6 py-4">
        <p className="font-semibold text-ink/80">{product.name}</p>
        <p className="text-xs text-ink/40">{product.slug}</p>
      </td>
      <td className="px-6 py-4">
        <Input
          type="number"
          className="w-28"
          value={priceFrom}
          onChange={(e) => setPriceFrom(Number(e.target.value))}
        />
      </td>
      <td className="px-6 py-4">
        <Switch checked={active} onCheckedChange={setActive} />
      </td>
      <td className="px-6 py-4">
        <Switch checked={featured} onCheckedChange={setFeatured} />
      </td>
      <td className="px-6 py-4 text-right">
        <Button size="sm" variant="secondary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Guardado" : "Guardar"}
        </Button>
      </td>
    </tr>
  );
}
