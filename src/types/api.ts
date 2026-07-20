/** Every backend response follows one of these two shapes. See backend/docs/API.md. */
export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
}

export interface ApiErrorBody {
  success: false
  message: string
  errors: Record<string, unknown>
}

export interface Paginated<T> {
  count: number
  total_pages: number
  current_page: number
  next: string | null
  previous: string | null
  results: T[]
}
