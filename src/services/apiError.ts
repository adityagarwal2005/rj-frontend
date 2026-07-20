export class ApiError extends Error {
  status: number
  errors: Record<string, unknown>

  constructor(message: string, status: number, errors: Record<string, unknown> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** First message for a given field, if the backend flagged one (e.g. "email"). */
  fieldError(field: string): string | undefined {
    const value = this.errors[field]
    if (Array.isArray(value)) return String(value[0])
    if (typeof value === 'string') return value
    return undefined
  }
}
