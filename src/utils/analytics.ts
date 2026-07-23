/**
 * Lightweight Google Analytics 4 integration, fully gated behind the
 * VITE_GA_MEASUREMENT_ID env var. If that var is unset (local dev, or before
 * you create a GA property), every function here is a no-op - nothing loads,
 * no network calls, no console noise. To enable: set VITE_GA_MEASUREMENT_ID
 * (e.g. "G-XXXXXXXXXX") in the Vercel project env and redeploy.
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

type GtagArgs = [string, ...unknown[]]

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: GtagArgs) => void
  }
}

let initialized = false

export function initAnalytics(): void {
  if (initialized || !GA_ID || typeof window === 'undefined') return
  initialized = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: GtagArgs) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  // send_page_view: false so we control pageviews on client-side route changes.
  window.gtag('config', GA_ID, { send_page_view: false })
}

/** Fire a pageview - call on each client-side route change. */
export function trackPageView(path: string): void {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

/** Fire a custom event (e.g. add_to_cart, begin_checkout). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!GA_ID || !window.gtag) return
  window.gtag('event', name, params)
}
