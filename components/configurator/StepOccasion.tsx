"use client";

import { OCCASIONS, type Occasion } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export function StepOccasion({ value, onChange }: { value: Occasion | null; onChange: (v: Occasion) => void }) {
  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">¿Para quién es este Momentia?</h2>
      <p className="mt-2 text-sm text-ink/60">Esto nos ayuda a sugerirte el tono perfecto para tu experiencia.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.value}
            type="button"
            onClick={() => onChange(occ.value)}
            className={cn(
              "flex flex-col items-center gap-2.5 rounded-2xl border-2 bg-blanco px-4 py-6 text-center transition-all",
              value === occ.value
                ? "border-borgona-500 bg-borgona-50 shadow-soft"
                : "border-ink/10 hover:border-borgona-200 hover:bg-borgona-50/40",
            )}
          >
            <span className="text-3xl">{occ.emoji}</span>
            <span className="text-sm font-semibold text-ink/80">{occ.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
