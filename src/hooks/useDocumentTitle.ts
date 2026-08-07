import { useEffect } from 'react'

const SITE_NAME = 'RajwadiTukda'
const SITE_URL = 'https://rajwaditukda.in'

interface DocumentTitleOptions {
  /** Page-specific meta description; falls back to the shared site description if omitted. */
  description?: string
  /** Path (e.g. "/products/kunafa-chocolate") used for the canonical link - defaults to the current URL path. */
  canonicalPath?: string
  /** Set true for pages that shouldn't show up in search results (account/checkout pages). */
  noindex?: boolean
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Sets the document title plus the SEO-relevant head tags (description,
 * OG/Twitter title+description, canonical URL, robots) for the current
 * page. A plain SPA client-side title swap isn't enough for search engines
 * to show distinct titles/descriptions per page in results - this keeps
 * everything in sync without needing a head-management library.
 */
export function useDocumentTitle(title: string, options: DocumentTitleOptions = {}) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`
    document.title = fullTitle
    setMeta('property', 'og:title', fullTitle)
    setMeta('name', 'twitter:title', fullTitle)

    if (options.description) {
      setMeta('name', 'description', options.description)
      setMeta('property', 'og:description', options.description)
      setMeta('name', 'twitter:description', options.description)
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${SITE_URL}${options.canonicalPath ?? window.location.pathname}`)

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', options.noindex ? 'noindex, nofollow' : 'index, follow')
  }, [title, options.description, options.canonicalPath, options.noindex])
}
