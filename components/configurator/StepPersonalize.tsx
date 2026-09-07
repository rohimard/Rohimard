"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ConfiguratorState } from "@/lib/types";

type Fields = Pick<
  ConfiguratorState,
  "recipientName" | "senderName" | "specialDate" | "message" | "letter" | "specialPhrase"
>;

export function StepPersonalize({
  values,
  onChange,
}: {
  values: Fields;
  onChange: <K extends keyof Fields>(key: K, value: Fields[K]) => void;
}) {
  return (
    <div>
      <h2 className="heading-display text-2xl sm:text-3xl">Personaliza tu historia</h2>
      <p className="mt-2 text-sm text-ink/60">Tu historia merece ser contada. Cuéntanosla con tus palabras.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipientName">Nombre de quien recibe el regalo</Label>
          <Input
            id="recipientName"
            placeholder="Ej. Ana"
            value={values.recipientName}
            onChange={(e) => onChange("recipientName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senderName">Nombre de quien lo envía</Label>
          <Input
            id="senderName"
            placeholder="Ej. Carlos"
            value={values.senderName}
            onChange={(e) => onChange("senderName", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialDate">Fecha especial (opcional)</Label>
          <Input
            id="specialDate"
            type="date"
            value={values.specialDate}
            onChange={(e) => onChange("specialDate", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            placeholder="Un mensaje corto que aparecerá en la experiencia digital..."
            value={values.message}
            onChange={(e) => onChange("message", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="letter">Carta (opcional)</Label>
          <Textarea
            id="letter"
            className="min-h-[160px]"
            placeholder="Escribe tu carta completa. Aparecerá tal cual en la sección “Carta para ti”."
            value={values.letter}
            onChange={(e) => onChange("letter", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specialPhrase">Frase especial (opcional)</Label>
          <Input
            id="specialPhrase"
            placeholder="Ej. Hay cosas que no caben dentro de una caja."
            value={values.specialPhrase}
            onChange={(e) => onChange("specialPhrase", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
