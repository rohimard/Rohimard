"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReturnStatus } from "@/lib/types";

// Transiciones permitidas para una devolución.
const NEXT: Partial<Record<ReturnStatus, { to: ReturnStatus; label: string; primary?: boolean }[]>> = {
  solicitada: [
    { to: "aprobada", label: "Aprobar", primary: true },
    { to: "rechazada", label: "Rechazar" },
  ],
  aprobada: [{ to: "recibida", label: "Marcar recibida", primary: true }],
  recibida: [{ to: "reembolsada", label: "Emitir reembolso", primary: true }],
};

export default function ReturnActions({
  returnId,
  status,
}: {
  returnId: string;
  status: ReturnStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const options = NEXT[status];

  if (!options) return <span className="text-xs text-slate-400">Sin acciones</span>;

  async function update(to: ReturnStatus) {
    setLoading(true);
    try {
      await fetch(`/api/returns/${returnId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: to }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {options.map((op) => (
        <button
          key={op.to}
          disabled={loading}
          onClick={() => update(op.to)}
          className={op.primary ? "btn-primary !py-1.5 !text-xs" : "btn-ghost !py-1.5 !text-xs"}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}
