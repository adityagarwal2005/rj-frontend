import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Vite inlines import.meta.env.* at build time, so a missing
  // VITE_API_BASE_URL produces a bundle that ships and renders but whose
  // every API call silently goes nowhere. Checking here fails the build (and
  // therefore the deploy) instead, which is far easier to notice than a site
  // that looks fine and does nothing. src/config/env.ts keeps a matching
  // runtime guard as a second line of defence.
  if (!env.VITE_API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Define it in .env for local development, ' +
        "or in the hosting provider's environment variables for a deployed build.",
    )
  }

  // Auth cookies are httpOnly and SameSite=Strict, which means they only work
  // when the API is same-origin with the app. Production gets that from the
  // Vercel rewrite in vercel.json; local development needs the equivalent
  // here, or `npm run dev` would be cross-origin and nobody could stay
  // logged in. VITE_API_PROXY_TARGET is the real backend both point at.
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:8001'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
