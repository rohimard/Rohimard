"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clienteDemo, itemsDemo } from "@/lib/demo";
import { formatCurrency, round2 } from "@/lib/format";
import { IconArrowRight, IconPlus, IconTrash } from "@/components/ui/icons";

interface Item {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

let idCounter = 0;
const nextId = () => `item-${idCounter++}`;

function itemTotal(it: Item) {
  return round2((it.cantidad || 0) * (it.precioUnitario || 0));
}

/** Convierte texto de input numérico a número, tolerando vacío. */
function toNumber(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function NuevaCotizacionForm() {
  const [cliente, setCliente] = useState({
    nombre: clienteDemo.nombre,
    telefono: clienteDemo.telefono,
    email: clienteDemo.email,
    direccion: clienteDemo.direccion,
  });
  const [servicio, setServicio] = useState(clienteDemo.servicio);

  const [items, setItems] = useState<Item[]>(() =>
    itemsDemo.map((it) => ({ id: nextId(), ...it })),
  );

  const [descuento, setDescuento] = useState(0); // monto en $
  const [impuestoPct, setImpuestoPct] = useState(0); // %
  const [generado, setGenerado] = useState(false);

  const { subtotal, impuestoMonto, total } = useMemo(() => {
    const sub = round2(items.reduce((sum, it) => sum + itemTotal(it), 0));
    const baseImponible = Math.max(0, sub - descuento);
    const imp = round2((baseImponible * impuestoPct) / 100);
    return {
      subtotal: sub,
      impuestoMonto: imp,
      total: round2(baseImponible + imp),
    };
  }, [items, descuento, impuestoPct]);

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: nextId(), descripcion: "", cantidad: 1, precioUnitario: 0 },
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGenerado(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generado && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-700">
          <strong className="font-semibold">¡Cotización lista!</strong> En esta
          fase la generación del PDF aún no está activa — llegará en la Fase 2.
          El total calculado es {formatCurrency(total)}.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna izquierda: formulario */}
        <div className="space-y-6 lg:col-span-2">
          {/* Datos del cliente */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink-900">
              Datos del cliente
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="c-nombre" className="input-label">
                  Nombre
                </label>
                <input
                  id="c-nombre"
                  className="input"
                  value={cliente.nombre}
                  onChange={(e) =>
                    setCliente({ ...cliente, nombre: e.target.value })
                  }
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="c-tel" className="input-label">
                  Teléfono
                </label>
                <input
                  id="c-tel"
                  type="tel"
                  inputMode="tel"
                  className="input"
                  value={cliente.telefono}
                  onChange={(e) =>
                    setCliente({ ...cliente, telefono: e.target.value })
                  }
                  placeholder="+52 55 1234 5678"
                />
              </div>
              <div>
                <label htmlFor="c-email" className="input-label">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className="input"
                  value={cliente.email}
                  onChange={(e) =>
                    setCliente({ ...cliente, email: e.target.value })
                  }
                  placeholder="juan@correo.com"
                />
              </div>
              <div>
                <label htmlFor="c-dir" className="input-label">
                  Dirección
                </label>
                <input
                  id="c-dir"
                  className="input"
                  value={cliente.direccion}
                  onChange={(e) =>
                    setCliente({ ...cliente, direccion: e.target.value })
                  }
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>
          </section>

          {/* Servicio */}
          <section className="card p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink-900">Servicio</h2>
            <div className="mt-4">
              <label htmlFor="servicio" className="input-label">
                Descripción del trabajo
              </label>
              <textarea
                id="servicio"
                rows={3}
                className="input resize-none"
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                placeholder="Describe brevemente el trabajo a realizar…"
              />
            </div>
          </section>

          {/* Items */}
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">Ítems</h2>
              <button
                type="button"
                onClick={addItem}
                className="btn-ghost px-2.5 py-1.5 text-sm text-brand-600 hover:bg-brand-50"
              >
                <IconPlus width={16} height={16} />
                Agregar ítem
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((it, index) => (
                <div
                  key={it.id}
                  className="rounded-xl border border-ink-100 bg-ink-50/40 p-3"
                >
                  {/* Fila 1: descripción + eliminar */}
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1">
                      <label className="input-label text-xs">
                        Descripción
                      </label>
                      <input
                        className="input py-2"
                        value={it.descripcion}
                        onChange={(e) =>
                          updateItem(it.id, { descripcion: e.target.value })
                        }
                        placeholder={`Ítem ${index + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      disabled={items.length === 1}
                      className="grid h-[42px] w-10 shrink-0 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-400"
                      aria-label="Eliminar ítem"
                    >
                      <IconTrash width={18} height={18} />
                    </button>
                  </div>

                  {/* Fila 2: cantidad · precio · total */}
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="min-w-0">
                      <label className="input-label text-xs">Cant.</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        className="input px-2.5 py-2"
                        value={it.cantidad === 0 ? "" : it.cantidad}
                        onChange={(e) =>
                          updateItem(it.id, {
                            cantidad: toNumber(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="input-label text-xs">Precio</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="any"
                        className="input px-2.5 py-2"
                        value={it.precioUnitario === 0 ? "" : it.precioUnitario}
                        onChange={(e) =>
                          updateItem(it.id, {
                            precioUnitario: toNumber(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <label className="input-label text-xs">Total</label>
                      <div className="flex h-[42px] items-center justify-end truncate rounded-xl bg-white px-2.5 text-sm font-semibold text-ink-900 ring-1 ring-inset ring-ink-100">
                        {formatCurrency(itemTotal(it))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Columna derecha: resumen (sticky en desktop) */}
        <div className="lg:col-span-1">
          <div className="card p-5 sm:p-6 lg:sticky lg:top-8">
            <h2 className="text-base font-semibold text-ink-900">Resumen</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="font-medium text-ink-900">
                  {formatCurrency(subtotal)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="descuento" className="text-ink-500">
                  Descuento
                </label>
                <div className="relative w-28">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                    $
                  </span>
                  <input
                    id="descuento"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="input py-2 pl-6 text-right"
                    value={descuento === 0 ? "" : descuento}
                    onChange={(e) => setDescuento(toNumber(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label htmlFor="impuesto" className="text-ink-500">
                  Impuestos
                </label>
                <div className="relative w-28">
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">
                    %
                  </span>
                  <input
                    id="impuesto"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    className="input py-2 pr-6 text-right"
                    value={impuestoPct === 0 ? "" : impuestoPct}
                    onChange={(e) => setImpuestoPct(toNumber(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {impuestoMonto > 0 && (
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <dt>Monto de impuestos</dt>
                  <dd>{formatCurrency(impuestoMonto)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-4 flex items-end justify-between border-t border-ink-100 pt-4">
              <span className="font-semibold text-ink-900">TOTAL</span>
              <span className="text-2xl font-bold tracking-tight text-brand-700">
                {formatCurrency(total)}
              </span>
            </div>

            <button type="submit" className="btn-primary btn-lg mt-5 w-full">
              Generar cotización
              <IconArrowRight width={18} height={18} />
            </button>
            <Link
              href="/dashboard"
              className="mt-2 block text-center text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              Cancelar
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
