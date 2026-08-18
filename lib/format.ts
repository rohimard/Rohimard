/** Utilidades de formato compartidas en toda la app. */

/**
 * Formatea un número como moneda: 315 -> "$315.00".
 *
 * Se hace manualmente (en vez de Intl.NumberFormat) para garantizar el mismo
 * resultado en el servidor y en cualquier navegador/teléfono. Con Intl, algunos
 * dispositivos muestran "USD 315.00" en lugar de "$315.00", lo que desbordaba
 * las casillas.
 */
export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? "-" : "";
  const [intPart, decPart] = Math.abs(safe).toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}.${decPart}`;
}

/** Redondea a 2 decimales evitando errores de coma flotante. */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
