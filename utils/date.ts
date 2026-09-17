const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDate(value: unknown): boolean {
  return typeof value === 'string' && ISO_DATE.test(value)
}
