"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generarBorradorAction } from "@/lib/actions/ai";
import type { DraftItem } from "@/lib/ai/quote-draft";
import type { AiCreditStatus } from "@/lib/types";
import { IconSparkles } from "@/components/ui/icons";

const OFICIOS = [
  "Electricista",
  "Plomero",
  "Pintor",
  "Carpintero",
  "Albañil",
  "Jardinero",
  "Técnico de aire acondicionado",
  "Cerrajero",
  "Fotógrafo",
  "Diseñador",
  "Otro",
];

export interface BorradorAplicado {
  serviceDescription: string;
  items: DraftItem[];
}

/**
 * Panel del asistente: el usuario describe el trabajo en lenguaje natural y
 * el modelo devuelve los ítems, que se vuelcan en el formulario.
 */
export function AsistenteIA({
  credits: initialCredits,
  enabled,
  onApply,
}: {
  credits: AiCreditStatus | null;
  /** False cuando falta HF_TOKEN o se está en modo demo. */
  enabled: boolean;
  onApply: (borrador: BorradorAplicado) => void;
}) {
  const [open, setOpen] = useState(false);
  const [job, setJob] = useState("");
  const [trade, setTrade] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState(initialCredits);
  const [pending, startTransition] = useTransition();

  const sinCreditos = credits ? credits.remaining <= 0 : false;

  function handleGenerate() {
    setError(null);
    setNotes([]);
    startTransition(async () => {
      const res = await generarBorradorAction({ job, trade, location });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCredits(res.data.credits);
      setNotes(res.data.draft.notes);
      onApply({
        serviceDescription: res.data.draft.service_description,
        items: res.data.draft.items,
      });
    });
  }

  return (
    <section className="card border-brand-100 bg-gradient-to-br from-brand-50/70 to-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <IconSparkles width={18} height={18} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink-900">
              Cotiza con IA
            </h2>
            <p className="text-xs text-ink-500">
              Describe el trabajo y se arma el desglose solo.
            </p>
          </div>
        </div>

        {credits && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              sinCreditos
                ? "bg-amber-100 text-amber-800"
                : "bg-white text-ink-500 ring-1 ring-inset ring-ink-100"
            }`}
          >
            {credits.remaining} de {credits.limit} este mes
          </span>
        )}
      </div>

      {!enabled ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-ink-500 ring-1 ring-inset ring-ink-100">
          El asistente se activa al configurar <code>HF_TOKEN</code> y Supabase.
          Mientras tanto puedes llenar la cotización a mano.
        </p>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-primary mt-4 w-full sm:w-auto"
        >
          <IconSparkles width={18} height={18} />
          Describir el trabajo
        </button>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="ia-job" className="input-label">
              ¿Qué hay que hacer?
            </label>
            <textarea
              id="ia-job"
              rows={3}
              className="input resize-none bg-white"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              maxLength={1000}
              placeholder="Cambiar 6 tomacorrientes y el tablero eléctrico en una casa de 2 pisos, incluye material y mano de obra."
            />
            <p className="mt-1 text-xs text-ink-400">
              Entre más detalle des, mejor queda el desglose.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ia-trade" className="input-label">
                Oficio
              </label>
              <select
                id="ia-trade"
                className="input bg-white"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
              >
                <option value="">Sin especificar</option>
                {OFICIOS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ia-zona" className="input-label">
                Ciudad o zona
              </label>
              <input
                id="ia-zona"
                className="input bg-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Guadalajara, México"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
              {sinCreditos && (
                <Link
                  href="/precios"
                  className="ml-1 font-semibold underline underline-offset-2"
                >
                  Ver planes
                </Link>
              )}
            </div>
          )}

          {notes.length > 0 && (
            <div className="rounded-xl border border-ink-100 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Antes de enviarla, revisa
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-600">
                {notes.map((n, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-600">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={pending || job.trim().length < 10}
              className="btn-primary disabled:opacity-50"
            >
              {pending ? "Generando…" : "Generar desglose"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              Cerrar
            </button>
            <span className="text-xs text-ink-400">
              Los precios son una estimación: revísalos antes de enviar.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
