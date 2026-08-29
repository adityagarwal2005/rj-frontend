/**
 * Bakes per-route HTML into dist/ after `vite build`.
 *
 * The app is a client-rendered SPA, so every URL used to serve the exact
 * same index.html: /products, /about and every product page all shipped the
 * homepage's <title>, description, canonical and og: tags. The real ones
 * were only applied by useDocumentTitle after React booted. That matters
 * because:
 *
 *   - WhatsApp, Instagram, Facebook, Slack and X do not run JavaScript when
 *     they unfurl a link, so every shared product URL previewed as the
 *     homepage - wrong title, wrong image, wrong description.
 *   - Bing and most non-Google crawlers likewise index the pre-JS HTML.
 *   - Google does render JS, but on a delayed second pass, so titles and
 *     snippets take longer to settle and can be missed entirely.
 *
 * This writes dist/<route>/index.html for each route with the correct head
 * tags already in place. Vercel checks the filesystem before applying the
 * SPA rewrite in vercel.json, so those files win for their own URLs and the
 * catch-all rewrite still handles anything not prerendered. The JS bundle is
 * untouched: React still boots and takes over exactly as before, so there is
 * no hydration step to mismatch.
 *
 * Per-route titles/descriptions come from src/constants/pageMeta.json - the
 * same file the app imports - so the prerendered head cannot drift from what
 * useDocumentTitle sets at runtime. Product pages are built from live API
 * data, mirroring ProductDetailPage's own title/description logic.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DIST = join(ROOT, 'dist')

const SITE_URL = 'https://rajwaditukda.in'
const SITE_NAME = 'RajwadiTukda'
const API_URL =
  process.env.VITE_API_BASE_URL ??
  'https://rajwaditukda-backend-916577009279.asia-south1.run.app/api'

const DEFAULT_IMAGE =
  'https://eobrrlghxiuyfxyrumdv.supabase.co/storage/v1/object/public/rajwaditukda/media/products/1/sc1.jpeg'

/** Mirrors the escaping the browser applies, so the HTML stays valid. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Replaces the content of an existing meta/link/title tag in the template.
 * Every tag this touches is already present in index.html, so a miss means
 * index.html changed shape - loud rather than silently shipping stale tags.
 */
function replaceTag(html, pattern, replacement, label, problems) {
  if (!pattern.test(html)) {
    problems.push(label)
    return html
  }
  return html.replace(pattern, replacement)
}

function buildHtml(template, { path, title, description, image }) {
  const problems = []
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`
  const t = escapeHtml(fullTitle)
  const d = escapeHtml(description)
  const img = escapeHtml(image ?? DEFAULT_IMAGE)

  let html = template
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`, 'title', problems)
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${d}" />`,
    'description',
    problems,
  )
  html = replaceTag(
    html,
    /<link rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${url}" />`,
    'canonical',
    problems,
  )
  html = replaceTag(
    html,
    /<meta property="og:title"[^>]*>/,
    `<meta property="og:title" content="${t}" />`,
    'og:title',
    problems,
  )
  html = replaceTag(
    html,
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${d}" />`,
    'og:description',
    problems,
  )
  html = replaceTag(
    html,
    /<meta property="og:url"[^>]*>/,
    `<meta property="og:url" content="${url}" />`,
    'og:url',
    problems,
  )
  html = replaceTag(
    html,
    /<meta property="og:image"[^>]*>/,
    `<meta property="og:image" content="${img}" />`,
    'og:image',
    problems,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:title"[^>]*>/,
    `<meta name="twitter:title" content="${t}" />`,
    'twitter:title',
    problems,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${d}" />`,
    'twitter:description',
    problems,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:image"[^>]*>/,
    `<meta name="twitter:image" content="${img}" />`,
    'twitter:image',
    problems,
  )

  // Product pages are a different og:type than the site as a whole.
  if (path.startsWith('/products/')) {
    html = html.replace(/<meta property="og:type"[^>]*>/, '<meta property="og:type" content="product" />')
  }

  return { html, problems }
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products/?page_size=200`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    return body?.data?.results ?? []
  } catch (error) {
    console.warn(`[prerender] Could not reach the API (${error.message}).`)
    console.warn('[prerender] Static pages will still be prerendered; product pages will fall back to the SPA shell.')
    return []
  }
}

function writeRoute(path, html) {
  // "/" is dist/index.html itself; every other route becomes a directory
  // with an index.html so the URL works with and without a trailing slash.
  const outDir = path === '/' ? DIST : join(DIST, path)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
}

async function main() {
  const templatePath = join(DIST, 'index.html')
  if (!existsSync(templatePath)) {
    console.error('[prerender] dist/index.html not found - run `vite build` first.')
    process.exit(1)
  }
  const template = readFileSync(templatePath, 'utf8')
  const pageMeta = JSON.parse(readFileSync(join(ROOT, 'src/constants/pageMeta.json'), 'utf8'))

  const routes = Object.entries(pageMeta).map(([path, meta]) => ({
    path,
    title: meta.title,
    description: meta.description,
  }))

  const products = await fetchProducts()
  for (const product of products) {
    // Mirrors ProductDetailPage: trim on a word boundary so the snippet
    // doesn't cut mid-word at Google's ~155 char limit.
    const trimmed = String(product.description ?? '')
      .slice(0, 150)
      .replace(/\s+\S*$/, '')
    routes.push({
      path: `/products/${product.slug}`,
      title: `${product.name} — Handmade in Jaipur`,
      description: trimmed ? `${trimmed}… Made fresh to order in Jaipur.` : undefined,
      image: product.primary_image ?? undefined,
    })
  }

  const allProblems = new Set()
  for (const route of routes) {
    const { html, problems } = buildHtml(template, {
      ...route,
      description: route.description ?? pageMeta['/'].description,
    })
    problems.forEach((p) => allProblems.add(p))
    writeRoute(route.path, html)
  }

  if (allProblems.size > 0) {
    // A tag we expected to rewrite wasn't in index.html. Failing the build
    // is deliberate: shipping pages that silently carry the homepage's tags
    // is the exact bug this script exists to prevent.
    console.error(
      `[prerender] These tags are missing from index.html so they could not be set per route: ${[...allProblems].join(', ')}`,
    )
    process.exit(1)
  }

  console.log(
    `[prerender] Wrote ${routes.length} routes (${products.length} product page${products.length === 1 ? '' : 's'}).`,
  )
}

main().catch((error) => {
  console.error('[prerender] Failed:', error)
  process.exit(1)
})
