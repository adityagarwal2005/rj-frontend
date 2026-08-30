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
