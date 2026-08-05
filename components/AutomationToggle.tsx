"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AutomationToggle({
  ruleId,
  enabled,
}: {
  ruleId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !on;
    setOn(next);
    try {
      await fetch(`/api/automations/${ruleId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      router.refresh();
    } catch {
      setOn(!next); // revertir
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={loading}
      onClick={toggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
