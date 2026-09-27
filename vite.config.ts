import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Auth cookies are httpOnly and SameSite=Strict, so the browser only sends
  // them to the origin that set them. The app therefore always calls the API
  // at the same-origin path /api (see src/config/env.ts) and something has to
  // forward that to the backend: this proxy locally, the rewrite in
  // vercel.json in production. Without it, `npm run dev` would be
  // cross-origin and nobody could stay logged in.
  //
  // Note for the production side (vercel.json is JSON and cannot hold this
  // comment - Vercel's schema rejects even a "_comment" key, which failed a
  // build): that rewrite must use the regex form /api/(.*) with a $1
  // substitution, NOT Vercel's /api/:path* segment syntax. :path* does not
  // match a trailing slash, so /api/products/ fell through to the SPA
  // catch-all and returned index.html - and since Django requires a trailing
  // slash on every endpoint, that silently broke every API call in
  // production while /api and /api/nonsense proxied fine.
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
    // `vite preview` serves the real build output, which is the only way to
    // see the prerendered HTML (scripts/prerender.mjs) locally. It needs the
    // same /api forwarding as the dev server or nothing on the page loads.
    preview: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
