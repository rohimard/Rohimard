"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "@/lib/actions/admin-orders";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/types";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    setValue(next as OrderStatus);
    startTransition(async () => {
      await updateOrderStatus(orderId, next as OrderStatus);
    });
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[...ORDER_STATUS_FLOW, "cancelado" as const].map((s) => (
          <SelectItem key={s} value={s}>
            {ORDER_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
