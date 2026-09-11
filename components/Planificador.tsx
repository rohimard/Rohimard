"use client";

import { useMemo, useState } from "react";
import CopiarBoton from "./CopiarBoton";
import {
  construirPlan,
  FORMATOS,
  LIMITE_GRATIS,
  LIMITE_PLUS,
  type Estrategia,
  type Formato,
} from "@/lib/plan";

const GUION_EJEMPLO = `Qué problema resuelve y para quién
Cómo funciona por dentro, paso a paso
Los tres errores más comunes al empezar
Un caso real con cifras
Qué hacer esta semana`;

export default function Planificador() {
  const [tema, setTema] = useState("");
  const [audiencia, setAudiencia] = useState("");
  const [guion, setGuion] = useState(GUION_EJEMPLO);
  const [minutos, setMinutos] = useState(8);
  const [formato, setFormato] = useState<Formato>("explainer");
  const [estrategia, setEstrategia] = useState<Estrategia>("bloques");
  const [limiteCaracteres, setLimite] = useState(LIMITE_GRATIS);

  const plan = useMemo(
    () => construirPlan({ tema, audiencia, guion, minutos, formato, estrategia, limiteCaracteres }),
    [tema, audiencia, guion, minutos, formato, estrategia, limiteCaracteres],
  );

  const todo = plan.bloques
    .map((b) => `— Bloque ${b.n}: ${b.titulo} (${b.minutos} min)\n${b.instruccion}`)
    .join("\n\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form className="space-y-5 rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-6 lg:self-start">
        <div>
          <label htmlFor="tema">Tema del vídeo</label>
          <input
            id="tema"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder="Cómo cotizar un trabajo eléctrico"
          />
        </div>

        <div>
          <label htmlFor="audiencia">Para quién es</label>
          <input
            id="audiencia"
            value={audiencia}
            onChange={(e) => setAudiencia(e.target.value)}
            placeholder="Electricistas que trabajan por su cuenta"
          />
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
            Es el dato que más alarga la narración: decirle a quién le habla obliga a
            explicar en vez de resumir.
          </p>
        </div>

        <div>
          <label htmlFor="guion">Guion o índice — un punto por línea</label>
          <textarea
            id="guion"
            rows={7}
            value={guion}
            onChange={(e) => setGuion(e.target.value)}
            className="font-mono text-[13px]"
          />
        </div>

        <div>
          <label htmlFor="minutos">
            Duración objetivo · <span className="text-accent">{minutos} min</span>
          </label>
          <input
            id="minutos"
            type="range"
            min={1}
            max={20}
            step={1}
            value={minutos}
            onChange={(e) => setMinutos(Number(e.target.value))}
            className="border-0 bg-transparent px-0 py-1 accent-accent"
          />
        </div>

        <div>
          <label htmlFor="formato">Formato</label>
          <select id="formato" value={formato} onChange={(e) => setFormato(e.target.value as Formato)}>
            {(Object.keys(FORMATOS) as Formato[]).map((clave) => (
              <option key={clave} value={clave}>
                {FORMATOS[clave].nombre} — hasta ~{FORMATOS[clave].maximo} min por vídeo
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-muted">{FORMATOS[formato].descripcion}</p>
        </div>

        <fieldset>
          <label htmlFor="estrategia-bloques">Estrategia</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["bloques", "Por bloques"],
                ["unico", "Un solo vídeo"],
              ] as const
            ).map(([valor, texto]) => (
              <button
                id={`estrategia-${valor}`}
                key={valor}
                type="button"
                onClick={() => setEstrategia(valor)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  estrategia === valor
                    ? "border-accent bg-accentSoft text-accent"
                    : "border-line text-muted hover:text-slate-200"
                }`}
              >
                {texto}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <label htmlFor="plan-gratis">Tu plan de NotebookLM</label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                [LIMITE_GRATIS, "Gratis", "500 car."],
                [LIMITE_PLUS, "Plus / Pro", "10.000 car."],
              ] as const
            ).map(([valor, texto, pista]) => (
              <button
                id={valor === LIMITE_GRATIS ? "plan-gratis" : "plan-plus"}
                key={valor}
                type="button"
                onClick={() => setLimite(valor)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  limiteCaracteres === valor
                    ? "border-accent bg-accentSoft text-accent"
                    : "border-line text-muted hover:text-slate-200"
                }`}
              >
                {texto}
                <span className="block text-[10px] font-normal opacity-70">{pista}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-line bg-surface px-5 py-4">
          <Dato valor={`${plan.bloques.length}`} etiqueta={plan.bloques.length === 1 ? "vídeo" : "vídeos"} />
          <Dato valor={`${plan.bloques[0]?.minutos ?? 0} min`} etiqueta="cada uno" />
          <Dato valor={`${plan.palabrasTotales.toLocaleString("es")}`} etiqueta="palabras en total" />
          <div className="ml-auto">
            <CopiarBoton texto={todo} etiqueta="Copiar el plan entero" />
          </div>
        </div>

        {plan.avisos.length > 0 && (
          <ul className="space-y-2">
            {plan.avisos.map((aviso) => (
              <li
                key={aviso}
                className="rounded-lg border border-accent/30 bg-accentSoft/40 px-4 py-2.5 text-[13px] leading-relaxed text-amber-200/90"
              >
                {aviso}
              </li>
            ))}
          </ul>
        )}

        {plan.bloques.map((bloque) => (
          <article key={bloque.n} className="rounded-xl border border-line bg-surface p-5">
            <header className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] text-accent">
                  BLOQUE {bloque.n} · {bloque.minutos} min · ~{bloque.palabras} palabras
                </p>
                <h3 className="mt-1 text-[15px] font-medium">{bloque.titulo}</h3>
              </div>
              <CopiarBoton texto={bloque.instruccion} />
            </header>

            {bloque.puntos.length > 1 && (
              <ul className="mb-3 space-y-1 text-[13px] text-muted">
                {bloque.puntos.map((punto) => (
                  <li key={punto} className="flex gap-2">
                    <span className="text-accent/60">·</span>
                    {punto}
                  </li>
                ))}
              </ul>
            )}

            <p className="whitespace-pre-wrap rounded-lg border border-line bg-ink p-3 font-mono text-[12.5px] leading-relaxed text-slate-300">
              {bloque.instruccion}
            </p>
            <p className="mt-2 text-right text-[11px] text-muted">
              {bloque.instruccion.length} / {limiteCaracteres} caracteres
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

function Dato({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <p className="leading-tight">
      <span className="text-xl font-semibold text-accent">{valor}</span>{" "}
      <span className="text-xs text-muted">{etiqueta}</span>
    </p>
  );
}
