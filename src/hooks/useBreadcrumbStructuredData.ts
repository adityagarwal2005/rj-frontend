import { SITE_URL } from '@/utils/seo'
import { useStructuredData } from './useStructuredData'

export interface Crumb {
  name: string
  /** Site-relative path, e.g. "/products". Omit for the current (last) page. */
  path?: string
}

/**
 * Emits BreadcrumbList JSON-LD so Google renders the "rajwaditukda.in ›
 * Shop › Kunafa Chocolate" trail in place of a bare URL in results, which
 * measurably improves click-through on deep pages.
 *
 * Pass `null` while the page's data is still loading.
 */
export function useBreadcrumbStructuredData(crumbs: Crumb[] | null) {
  const data = crumbs
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          // The final crumb is the current page: schema.org says to leave
          // `item` off it rather than self-linking.
          ...(crumb.path ? { item: `${SITE_URL}${crumb.path}` } : {}),
        })),
      }
    : null

  useStructuredData('breadcrumb-structured-data', data)
}
