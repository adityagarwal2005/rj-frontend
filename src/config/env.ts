/**
 * Validated build-time configuration.
 *
 * VITE_API_BASE_URL used to be read straight through with no default and no
 * check. If it was missing at build time - a deleted Vercel env var, a
 * preview deploy that never had it, a typo'd name - the value was simply
 * `undefined`, axios fell back to relative URLs, and every API call went to
 * https://rajwaditukda.in/api/... which does not exist. The build succeeded,
 * the site deployed, the pages rendered, and nothing worked. Failing here
 * turns that into an obvious build error instead of a silently broken site.
 */

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL is not set. Define it in .env for local development, ' +
      'or in the hosting provider\'s environment variables for a deployed build.',
  )
}

export const env = {
  apiBaseUrl,
} as const
