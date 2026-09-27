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
// Node cannot fetch a relative URL, and VITE_API_BASE_URL is now "/api"
// (the app talks to the API same-origin through a proxy). Build-time scripts
// therefore need the backend's absolute origin instead.
const API_URL = `${
  process.env.VITE_API_PROXY_TARGET ??
  'https://rajwaditukda-backend-916577009279.asia-south1.run.app'
}/api`

const DEFAULT_IMAGE =
  'https://eobrrlghxiuyfxyrumdv.supabase.co/storage/v1/object/public/rajwaditukda/media/products/1/sc3.jpeg'

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

function buildHtml(template, { path, title, description, image, products = [], product = null }) {
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

  // Real content for crawlers, in place of the loading splash.
  const marker = /<!--PRERENDER:START-->[\s\S]*?<!--PRERENDER:END-->/
  if (!marker.test(html)) {
    problems.push('prerender-markers')
  } else {
    html = html.replace(marker, `<!--PRERENDER:START-->${staticBody({ path, title, description }, products, product)}<!--PRERENDER:END-->`)
    html = html.replace('</head>', `<style>${SHELL_STYLE}</style></head>`)
  }

  // The largest image on the page is fetched by JavaScript only after the
  // product API answers, so the browser cannot discover it early on its own.
  const lcpImage = product?.primary_image ?? (path === '/' ? products[0]?.primary_image : null)
  if (lcpImage) {
    html = html.replace(
      '</head>',
      `<link rel="preload" as="image" href="${escapeHtml(lcpImage)}" fetchpriority="high" /></head>`,
    )
  }

  return { html, problems }
}

/**
 * Static markup for the crawler (and for the first paint on a slow phone).
 *
 * Google renders JavaScript, but it queues that work, and a brand-new domain
 * can wait a long time in that queue - meanwhile Bing, DuckDuckGo and every
 * social/AI crawler see nothing at all. A product page was serving 13
 * characters of text: the loading splash. This puts the real heading, copy,
 * prices and internal links in the HTML itself.
 *
 * Everything below has to stay TRUE to what the React page renders - it is
 * the same content arriving earlier, not a separate version written for
 * search engines.
 */
const SHELL_STYLE = `
.rt-shell { max-width: 60rem; margin: 0 auto; padding: 1.5rem 1.25rem 3rem; font-family: Inter, system-ui, sans-serif; color: #241512; }
.rt-shell-top { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.75rem 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #ede0d0; }
.rt-shell-brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.6rem; font-weight: 600; color: #241610; text-decoration: none; }
.rt-shell-brand span { color: #af8a48; }
.rt-shell-nav a { margin-right: 1rem; font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: #3a2420; text-decoration: none; }
.rt-shell h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: clamp(2.2rem, 7vw, 3.4rem); line-height: 1.05; margin: 2rem 0 0.75rem; color: #241610; }
.rt-shell h2 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.6rem; margin: 2rem 0 0.75rem; color: #241610; }
.rt-shell p { line-height: 1.7; margin: 0 0 0.9rem; color: rgba(36,21,18,0.78); max-width: 42rem; }
.rt-shell ul { list-style: none; padding: 0; margin: 0 0 1.25rem; }
.rt-shell li { padding: 0.55rem 0; border-bottom: 1px solid #ede0d0; }
.rt-shell li a { color: #241610; text-decoration: none; font-weight: 600; }
.rt-shell-price { color: #8f6f39; font-weight: 600; }
.rt-shell-foot { margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid #ede0d0; font-size: 0.85rem; color: rgba(36,21,18,0.6); }
`

function money(value) {
  const amount = Number.parseFloat(value)
  return Number.isFinite(amount) ? `₹${amount.toFixed(2)}` : ''
}

function productListItems(products) {
  if (products.length === 0) return ''
  return `<ul>${products
    .map(
      (p) =>
        `<li><a href="/products/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a> — <span class="rt-shell-price">${money(
          p.effective_price,
        )}</span>${p.weight_label ? ` · ${escapeHtml(p.weight_label)}` : ''}${
          p.in_stock ? '' : ' · Sold out'
        }</li>`,
    )
    .join('')}</ul>`
}

function shell(inner) {
  return `<div class="rt-shell">
<header class="rt-shell-top">
<a class="rt-shell-brand" href="/">Rajwadi<span>Tukda</span></a>
<nav class="rt-shell-nav"><a href="/">Home</a><a href="/products">Shop</a><a href="/about">Our Story</a><a href="/contact">Contact</a></nav>
</header>
<main>${inner}</main>
<footer class="rt-shell-foot">Handmade in Bani Park, Jaipur &middot; Same-day delivery across Jaipur &middot; WhatsApp +91 70142 53541 &middot; <a href="/privacy-policy">Privacy</a> &middot; <a href="/terms">Terms</a> &middot; <a href="/refund-policy">Refunds</a></footer>
</div>`
}

function staticBody(route, products, product) {
  if (product) {
    return shell(
      `<h1>${escapeHtml(product.name)}</h1>
<p><span class="rt-shell-price">${money(product.effective_price)}</span>${
        product.weight_label ? ` · ${escapeHtml(product.weight_label)}` : ''
      } · ${product.in_stock ? 'In stock' : 'Sold out'} · Handmade in Jaipur</p>
<p>${escapeHtml(product.description ?? '')}</p>
${product.ingredients ? `<h2>Ingredients</h2><p>${escapeHtml(product.ingredients)}</p>` : ''}
<p><a href="/products">Browse all chocolates</a></p>`,
    )
  }

  if (route.path === '/') {
    return shell(
      `<h1>Handmade Chocolates in Jaipur</h1>
<p>A small Jaipur kitchen making chocolate by hand, in small batches — kunafa, Biscoff, kesar and more — and delivered to your door the day it is made.</p>
<h2>Our chocolates</h2>
${productListItems(products)}
<p>Same-day delivery across Jaipur. Pay by UPI, card or wallet, or cash on delivery. 5% off orders over ₹800, applied automatically.</p>
<p><a href="/products">Shop the collection</a> &middot; <a href="/about">Our story</a></p>`,
    )
  }

  if (route.path === '/products') {
    return shell(
      `<h1>Shop Handcrafted Chocolates in Jaipur</h1>
<p>Handmade chocolate bars and lollipops — Kunafa, Biscoff and more — finished by hand in our Bani Park kitchen and made the day they ship, with same-day delivery across Jaipur.</p>
${productListItems(products)}`,
    )
  }

  if (route.path === '/about') {
    return shell(
      `<h1>Rajasthani Roots, Chocolate Craft</h1>
<p>A small Jaipur kitchen that is trying to answer one question — what would a Rajasthani palace chocolatier make in 2026?</p>
<p>RajwadiTukda began with a simple idea: take the bold, warm flavors of Rajasthan and fold them into premium, handcrafted chocolate. Not a mithai box, not a generic chocolate bar — a third thing that treats both traditions with respect.</p>
<p>We use Belgian-style couverture, hand-selected fillings and no shortcuts. Every batch is made fresh, in small quantities, in Bani Park, Jaipur.</p>
<p><a href="/products">Explore the chocolates</a></p>`,
    )
  }

  if (route.path === '/contact') {
    return shell(
      `<h1>Contact RajwadiTukda, Jaipur</h1>
<p>Questions about an order, bulk gifting, or just want to say hello? Reach us directly.</p>
<ul>
<li>WhatsApp: <a href="https://wa.me/917014253541">+91 70142 53541</a></li>
<li>Phone: <a href="tel:+917014253541">+91 70142 53541</a> (10am – 8pm, every day)</li>
<li>Email: <a href="mailto:adityakp215@gmail.com">adityakp215@gmail.com</a></li>
<li>Address: Bani Park, Jaipur, Rajasthan 302016</li>
<li>Instagram: <a href="https://www.instagram.com/rajwaditukda">@rajwaditukda</a></li>
</ul>`,
    )
  }

  // Legal pages and anything else: heading plus the page's own description.
  return shell(`<h1>${escapeHtml(route.title)}</h1><p>${escapeHtml(route.description ?? '')}</p>`)
}

async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products/?page_size=200`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(20000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const body = await response.json()
    const products = body?.data?.results ?? []

    // The list endpoint omits description and ingredients - exactly the copy
    // worth putting in the HTML - so pull each product's detail too. A
    // failure here only costs that product's body text, never the build.
    await Promise.all(
      products.map(async (product) => {
        try {
          const detail = await fetch(`${API_URL}/products/${product.slug}/`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(20000),
          })
          if (!detail.ok) return
          const detailBody = await detail.json()
          product.description = detailBody?.data?.description ?? ''
          product.ingredients = detailBody?.data?.ingredients ?? ''
        } catch {
          /* leave this product without body copy */
        }
      }),
    )
    return products
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
  const productBySlug = new Map()
  for (const product of products) {
    productBySlug.set(`/products/${product.slug}`, product)
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
      products,
      product: productBySlug.get(route.path) ?? null,
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
