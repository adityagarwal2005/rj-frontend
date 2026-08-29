import pageMetaJson from './pageMeta.json'

export interface PageMeta {
  title: string
  description: string
}

/**
 * Per-route title/description for every indexable page.
 *
 * Deliberately a .json file rather than inline strings in each page: the
 * build-time prerender script (scripts/prerender.mjs) reads the same file
 * from Node to bake these into the static HTML each route serves. Keeping
 * one source of truth means the title a crawler sees in the raw HTML can
 * never drift from the one useDocumentTitle sets after hydration.
 *
 * Only indexable pages belong here - account/checkout/auth pages are
 * noindex and pass their titles inline.
 */
export const PAGE_META: Record<string, PageMeta> = pageMetaJson

export function pageMeta(path: string): PageMeta {
  const meta = PAGE_META[path]
  if (!meta) throw new Error(`No page metadata defined for route "${path}" (see pageMeta.json)`)
  return meta
}
