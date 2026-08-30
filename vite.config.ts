import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  // Vite inlines import.meta.env.* at build time, so a missing
  // VITE_API_BASE_URL produces a bundle that ships and renders but whose
  // every API call silently goes nowhere. Checking here fails the build (and
  // therefore the deploy) instead, which is far easier to notice than a
  // site that looks fine and does nothing. src/config/env.ts keeps a
  // matching runtime guard as a second line of defence.
  const env = loadEnv(mode, process.cwd(), '')
  if (!env.VITE_API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL is not set. Define it in .env for local development, ' +
        "or in the hosting provider's environment variables for a deployed build.",
    )
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
