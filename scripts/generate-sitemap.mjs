/**
 * Regenerates public/sitemap.xml from the live product catalog.
 *
 * The sitemap used to be hand-maintained, so every product added after it
 * was written (the two lollipops, for one) simply never got listed for
 * Google to crawl. This pulls the real slugs from the API instead.
 *
 * Runs as part of `npm run build`. If the API is unreachable (Cloud Run
 * cold start, no network in CI), it warns and leaves the committed
 * sitemap.xml untouched rather than failing the build or, worse, writing
 * an empty sitemap that would deindex every product page.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const SITE_URL = 'https://rajwaditukda.in'
const API_URL =
  process.env.VITE_API_BASE_URL ??
  'https://rajwaditukda-backend-916577009279.asia-south1.run.app/api'

/** Pages that always exist, independent of the catalog. */
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.2' },
]

function urlEntry({ path, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${path}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

async function fetchProducts() {
  // page_size is generous on purpose: the catalog is tiny today, but a
  // paginated response would silently truncate the sitemap otherwise.
  const response = await fetch(`${API_URL}/products/?page_size=200`, {
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`API responded ${response.status}`)
  const body = await response.json()
  const results = body?.data?.results
  if (!Array.isArray(results)) throw new Error('Unexpected API response shape')
  return results
}

async function main() {
  let products
  try {
    products = await fetchProducts()
  } catch (error) {
    console.warn(`[sitemap] Skipped regeneration - could not reach the API: ${error.message}`)
    console.warn('[sitemap] Keeping the existing public/sitemap.xml.')
    return
  }

  if (products.length === 0) {
    console.warn('[sitemap] API returned zero products; keeping the existing sitemap.')
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const entries = [
    ...STATIC_ROUTES.map((route) => urlEntry({ ...route, lastmod: today })),
    ...products.map((product) =>
      urlEntry({
        path: `/products/${product.slug}`,
        changefreq: 'weekly',
        priority: '0.9',
        lastmod: today,
      }),
    ),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml')
  writeFileSync(outPath, xml, 'utf8')
  console.log(`[sitemap] Wrote ${entries.length} URLs (${products.length} products) to public/sitemap.xml`)
}

main()
