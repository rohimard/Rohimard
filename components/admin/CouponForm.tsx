"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { createCoupon } from "@/lib/actions/admin-coupons";

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await createCoupon({ code, discountType, discountValue, maxUses: maxUses || undefined, expiresAt });
    setSaving(false);
    if (!res.success) {
      setError(res.error ?? "Ocurrió un error.");
      return;
    }
    setCode("");
    setDiscountValue("");
    setMaxUses("");
    setExpiresAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium grid gap-4 p-6 sm:grid-cols-5 sm:items-end">
      <div className="space-y-2">
        <Label htmlFor="code">Código</Label>
        <Input id="code" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="MOMENTIA10" />
      </div>
      <div className="space-y-2">
        <Label>Tipo</Label>
        <Select value={discountType} onValueChange={(v) => setDiscountType(v as typeof discountType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">% Porcentaje</SelectItem>
            <SelectItem value="fixed">S/ Monto fijo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="discountValue">Valor</Label>
        <Input id="discountValue" type="number" required value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxUses">Usos máx. (opcional)</Label>
        <Input id="maxUses" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">Expira (opcional)</Label>
        <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </div>
      {error && <p className="text-sm text-rubi-600 sm:col-span-5">{error}</p>}
      <Button type="submit" disabled={saving} className="sm:col-span-5 sm:w-fit">
        <Plus className="h-4 w-4" /> {saving ? "Creando..." : "Crear cupón"}
      </Button>
    </form>
  );
}
