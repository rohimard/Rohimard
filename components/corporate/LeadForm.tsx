"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitCorporateLead } from "@/lib/actions/corporate";
import type { CorporateLeadInput } from "@/lib/validations/order";

const EMPTY: CorporateLeadInput = {
  company: "",
  contactName: "",
  position: "",
  email: "",
  phone: "",
  approxQuantity: undefined,
  budget: "",
  eventType: "",
  message: "",
};

export function LeadForm() {
  const [values, setValues] = useState<CorporateLeadInput>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof CorporateLeadInput>(key: K, value: CorporateLeadInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitCorporateLead(values);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error ?? "Ocurrió un error.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="card-premium flex flex-col items-center gap-3 p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-borgona-600" />
        <h3 className="heading-display text-xl">¡Solicitud enviada!</h3>
        <p className="text-sm text-ink/65">
          Gracias por escribirnos. Nuestro equipo se pondrá en contacto contigo muy pronto para preparar tu cotización.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-premium grid gap-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" required value={values.company} onChange={(e) => update("company", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Nombre</Label>
          <Input id="contactName" required value={values.contactName} onChange={(e) => update("contactName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Cargo</Label>
          <Input id="position" value={values.position} onChange={(e) => update("position", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={values.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" required value={values.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="approxQuantity">Cantidad aproximada</Label>
          <Input
            id="approxQuantity"
            type="number"
            min={1}
            value={values.approxQuantity ?? ""}
            onChange={(e) => update("approxQuantity", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Presupuesto</Label>
          <Input id="budget" placeholder="Ej. S/ 2,000 - S/ 5,000" value={values.budget} onChange={(e) => update("budget", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventType">Tipo de evento</Label>
          <Input id="eventType" placeholder="Ej. Aniversario de la empresa" value={values.eventType} onChange={(e) => update("eventType", e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea id="message" value={values.message} onChange={(e) => update("message", e.target.value)} />
      </div>

      {error && <p className="text-sm text-rubi-600">{error}</p>}

      <Button type="submit" size="lg" disabled={submitting} className="justify-self-start">
        <Send className="h-4 w-4" /> {submitting ? "Enviando..." : "Solicitar cotización"}
      </Button>
    </form>
  );
}
