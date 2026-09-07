"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleCoupon } from "@/lib/actions/admin-coupons";

export function CouponToggle({ id, active }: { id: string; active: boolean }) {
  const [checked, setChecked] = useState(active);
  const [, startTransition] = useTransition();

  return (
    <Switch
      checked={checked}
      onCheckedChange={(v) => {
        setChecked(v);
        startTransition(async () => {
          await toggleCoupon(id, v);
        });
      }}
    />
  );
}
