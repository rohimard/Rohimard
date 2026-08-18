"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import { CURRENCIES } from "@/lib/format";
import { IconCheck } from "@/components/ui/icons";
import type { Profile } from "@/lib/types";

export function ConfiguracionForm({
  profile,
  demo,
}: {
  profile: Profile;
  demo: boolean;
}) {
  const [form, setForm] = useState({
    business_name: profile.business_name,
    full_name: profile.full_name,
    phone: profile.phone,
    email: profile.email,
    address: profile.address,
    currency: profile.currency || "USD",
    tax_rate: profile.tax_rate ?? 0,
    quote_prefix: profile.quote_prefix || "COT-",
  });
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<
    { type: "ok" | "error"; text: string } | null
  >(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await updateProfileAction({
        ...form,
        tax_rate: Number(form.tax_rate) || 0,
      });
      if (res.ok) {
        setMessage({ type: "ok", text: "Cambios guardados correctamente." });
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {demo && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <strong className="font-semibold">Modo demo:</strong> los cambios no se
          guardarán hasta configurar Supabase.
        </div>
      )}

      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink-900">
          Datos del negocio
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="business_name" className="input-label">
              Nombre del negocio
            </label>
            <input
              id="business_name"
              className="input"
              value={form.business_name}
              onChange={(e) => set("business_name", e.target.value)}
              placeholder="Instalaciones RC"
            />
          </div>
          <div>
            <label htmlFor="full_name" className="input-label">
              Nombre del propietario
            </label>
            <input
              id="full_name"
              className="input"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Carlos Ramírez"
            />
          </div>
          <div>
            <label htmlFor="phone" className="input-label">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              className="input"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div>
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contacto@negocio.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className="input-label">
              Dirección
            </label>
            <input
              id="address"
              className="input"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Calle, número, ciudad"
            />
          </div>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h2 className="text-base font-semibold text-ink-900">
          Preferencias de cotización
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="currency" className="input-label">
              Moneda
            </label>
            <select
              id="currency"
              className="input"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tax_rate" className="input-label">
              Impuesto por defecto (%)
            </label>
            <input
              id="tax_rate"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              className="input"
              value={form.tax_rate === 0 ? "" : form.tax_rate}
              onChange={(e) => set("tax_rate", Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="quote_prefix" className="input-label">
              Prefijo de cotización
            </label>
            <input
              id="quote_prefix"
              className="input"
              value={form.quote_prefix}
              onChange={(e) => set("quote_prefix", e.target.value)}
              placeholder="COT-"
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Las cotizaciones se numeran así: {form.quote_prefix || "COT-"}0001,{" "}
          {form.quote_prefix || "COT-"}0002…
        </p>
      </section>

      {message && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "ok"
              ? "bg-accent-50 text-accent-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary btn-lg w-full sm:w-auto"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
          {!pending && <IconCheck width={18} height={18} />}
        </button>
      </div>
    </form>
  );
}
