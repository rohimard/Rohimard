export function formatCurrency(amount: number) {
  return `S/ ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyCompact(amount: number) {
  const isInteger = Number.isInteger(amount);
  return `S/ ${amount.toLocaleString("es-PE", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
