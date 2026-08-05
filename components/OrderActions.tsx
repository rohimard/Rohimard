"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OrderActions({
  orderId,
  nextLabel,
  canNotify,
}: {
  orderId: string;
  nextLabel: string | null;
  canNotify: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function call(action: "advance" | "notify", body?: object) {
    setLoading(action);
    setToast(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      if (data.applied?.length) {
        setToast(
          `Hecho. Automatizaciones: ${data.applied.map((a: { effect: string }) => a.effect).join(" · ")}`
        );
      } else {
        setToast(data.message ?? "Hecho.");
      }
      router.refresh();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {nextLabel && (
          <button
            className="btn-primary"
            disabled={loading !== null}
            onClick={() => call("advance")}
          >
            {loading === "advance" ? "Procesando…" : nextLabel}
          </button>
        )}
        {canNotify && (
          <>
            <button
              className="btn-ghost"
              disabled={loading !== null}
              onClick={() => call("notify", { via: "whatsapp" })}
            >
              {loading === "notify" ? "Enviando…" : "Avisar por WhatsApp"}
            </button>
            <button
              className="btn-ghost"
              disabled={loading !== null}
              onClick={() => call("notify", { via: "email" })}
            >
              Avisar por email
            </button>
          </>
        )}
      </div>
      {toast && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {toast}
        </div>
      )}
    </div>
  );
}
