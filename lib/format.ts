/** Utilidades de formato compartidas en toda la app. */

/**
 * Formatea un número como moneda: 315 -> "$315.00".
 *
 * Se hace manualmente (en vez de Intl.NumberFormat) para garantizar el mismo
 * resultado en el servidor y en cualquier navegador/teléfono. Con Intl, algunos
 * dispositivos muestran "USD 315.00" en lugar de "$315.00", lo que desbordaba
 * las casillas.
 */
export function formatCurrency(value: number, symbol = "$"): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? "-" : "";
  const [intPart, decPart] = Math.abs(safe).toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}${symbol}${grouped}.${decPart}`;
}

/** Monedas soportadas y su símbolo para mostrar importes. */
export const CURRENCIES: { code: string; label: string; symbol: string }[] = [
  { code: "USD", label: "USD — Dólar", symbol: "$" },
  { code: "MXN", label: "MXN — Peso mexicano", symbol: "$" },
  { code: "EUR", label: "EUR — Euro", symbol: "€" },
  { code: "COP", label: "COP — Peso colombiano", symbol: "$" },
  { code: "PEN", label: "PEN — Sol peruano", symbol: "S/" },
  { code: "ARS", label: "ARS — Peso argentino", symbol: "$" },
  { code: "CLP", label: "CLP — Peso chileno", symbol: "$" },
  { code: "GTQ", label: "GTQ — Quetzal", symbol: "Q" },
];

/** Devuelve el símbolo de una moneda por su código (por defecto "$"). */
export function currencySymbol(code?: string | null): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

/** Fecha corta legible: "2026-08-18" -> "18 ago 2026". */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
