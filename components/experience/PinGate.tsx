"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { resolveExperience } from "@/lib/actions/experience";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ExperienceData } from "@/lib/types/experience";

export function PinGate({ slug, onUnlock }: { slug: string; onUnlock: (data: ExperienceData) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await resolveExperience(slug, pin);
      if (result.status === "ok") {
        onUnlock(result.data);
      } else if (result.status === "needs_pin") {
        setError(result.error ?? "Ingresa el código PIN.");
      } else {
        setError("Esta experiencia ya no está disponible.");
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-borgona-800 to-borgona-600 px-6 text-center text-crema-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dorado-300/20 text-dorado-200">
        <Lock className="h-6 w-6" />
      </div>
      <h1 className="heading-display mt-5 text-2xl text-blanco">Esta experiencia es privada</h1>
      <p className="mt-2 max-w-xs text-sm text-crema-100/80">
        Ingresa el código PIN que te compartieron junto con tu regalo.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-xs flex-col items-center gap-3">
        <Input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="text-center tracking-[0.3em] text-blanco placeholder:text-blanco/40"
          style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.25)" }}
          inputMode="numeric"
        />
        {error && <p className="text-sm text-rosa-200">{error}</p>}
        <Button type="submit" variant="gold" className="w-full" disabled={isPending}>
          {isPending ? "Verificando..." : "Ver mi Momentia"}
        </Button>
      </form>
    </div>
  );
}
