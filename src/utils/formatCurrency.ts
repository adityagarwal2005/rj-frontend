const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

/** Backend serializes DecimalFields as strings (e.g. "300.00"). */
export function formatCurrency(value: string | number): string {
  const numeric = typeof value === 'string' ? Number.parseFloat(value) : value
  return formatter.format(Number.isFinite(numeric) ? numeric : 0)
}
