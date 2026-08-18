"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createClientAction,
  updateClientAction,
} from "@/lib/actions/clients";
import { IconCheck } from "@/components/ui/icons";
import type { Client } from "@/lib/types";

export function ClienteForm({
  initial,
  demo,
}: {
  initial?: Client | null;
  demo: boolean;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    startTransition(async () => {
      const res =
        isEdit && initial
          ? await updateClientAction(initial.id, form)
          : await createClientAction(form);
      if (res.ok) {
        router.push("/dashboard/clientes");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {demo && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <strong className="font-semibold">Modo demo:</strong> configura Supabase
          para guardar clientes reales.
        </div>
      )}

      <section className="card p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="input-label">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Juan Pérez"
              autoFocus
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
              placeholder="juan@correo.com"
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

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href="/dashboard/clientes" className="btn-secondary">
          Cancelar
        </Link>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar cliente"}
          {!pending && <IconCheck width={18} height={18} />}
        </button>
      </div>
    </form>
  );
}
