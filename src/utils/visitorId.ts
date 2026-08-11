const STORAGE_KEY = 'rajwaditukda.visitor_id'

/** Anonymous, non-identifying id used only to approximate unique visitor counts. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}
