import { useEffect } from 'react'

/**
 * Injects a JSON-LD <script> into <head> for the lifetime of the calling
 * component, then removes it on unmount so schema from one page can never
 * leak onto the next (a real risk in an SPA, where the document is never
 * reloaded between routes).
 *
 * `id` must be unique per schema type on a page - reusing an id replaces
 * the existing block rather than adding a second one.
 *
 * Pass `null` for `data` to render nothing (e.g. while a product is still
 * loading), rather than emitting a half-empty schema Google would reject.
 */
export function useStructuredData(id: string, data: Record<string, unknown> | null) {
  // Serialize in the dependency list so a caller can build the object
  // inline (a new reference every render) without causing an infinite
  // re-render loop.
  const serialized = data ? JSON.stringify(data) : null

  useEffect(() => {
    if (!serialized) return

    let script = document.getElementById(id) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = serialized

    return () => {
      document.getElementById(id)?.remove()
    }
  }, [id, serialized])
}
