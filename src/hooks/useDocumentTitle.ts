import { useEffect } from 'react'
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/utils/seo'

interface DocumentTitleOptions {
  /** Page-specific meta description; falls back to the shared site description if omitted. */
  description?: string
  /** Path (e.g. "/products/kunafa-chocolate") used for the canonical link - defaults to the current URL path. */
  canonicalPath?: string
  /** Set true for pages that shouldn't show up in search results (account/checkout pages). */
  noindex?: boolean
  /** Absolute image URL for social link previews; falls back to whatever index.html set. */
  image?: string
  /**
   * Use the title verbatim instead of appending " | RajwadiTukda". For pages
   * whose title already contains the brand name, so it isn't repeated twice.
   */
  exactTitle?: boolean
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

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets the document title plus the SEO-relevant head tags (description,
 * OG/Twitter title+description+url, canonical URL, robots) for the current
 * page. A plain SPA client-side title swap isn't enough for search engines
 * to show distinct titles/descriptions per page in results - this keeps
 * everything in sync without needing a head-management library.
 */
export function useDocumentTitle(title: string, options: DocumentTitleOptions = {}) {
  const { description, canonicalPath, noindex, image, exactTitle } = options

  useEffect(() => {
    const fullTitle = exactTitle ? title : `${title} | ${SITE_NAME}`
    document.title = fullTitle
    setMeta('property', 'og:title', fullTitle)
    setMeta('name', 'twitter:title', fullTitle)

    const resolvedDescription = description ?? DEFAULT_DESCRIPTION
    setMeta('name', 'description', resolvedDescription)
    setMeta('property', 'og:description', resolvedDescription)
    setMeta('name', 'twitter:description', resolvedDescription)

    // og:url has to track the current route too - left at the index.html
    // value, every shared link previewed as the homepage regardless of
    // which page was actually shared.
    const url = `${SITE_URL}${canonicalPath ?? window.location.pathname}`
    setLink('canonical', url)
    setMeta('property', 'og:url', url)

    if (image) {
      setMeta('property', 'og:image', image)
      setMeta('name', 'twitter:image', image)
    }

    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
  }, [title, description, canonicalPath, noindex, image, exactTitle])
}
