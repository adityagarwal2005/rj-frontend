/**
 * Runtime configuration.
 *
 * The API base is a hardcoded same-origin path, deliberately not an
 * environment variable. Auth now rides on httpOnly `SameSite=Strict`
 * cookies, which the browser only ever sends to the site that set them - so
 * the app talking to the API on its own origin is a correctness requirement,
 * not a preference. `/api` is proxied through to the backend by the rewrite
 * in vercel.json (production) and the Vite dev-server proxy (local).
 *
 * This used to read VITE_API_BASE_URL. That made the single most
 * load-bearing assumption in the auth design silently overridable by a
 * hosting-provider env var: point it at the backend's own origin and every
 * request goes cross-site, the cookies are never attached, and nobody can
 * log in - with no build error and no obvious cause.
 *
 * The backend's absolute origin is still configurable, but only where it
 * genuinely varies: VITE_API_PROXY_TARGET, read by the dev server and the
 * build-time sitemap/prerender scripts, never by the browser.
 */

export const env = {
  apiBaseUrl: '/api',
} as const
