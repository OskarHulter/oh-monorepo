import tailwindcss from '@tailwindcss/vite'
import { varlockVitePlugin } from '@varlock/vite-integration'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// Interpolate %ENV_VAR% in index.html from process.env at transform time.
// Vite's built-in interpolation only handles VITE_* prefixed names; varlock's
// SITE_* schema lives outside that prefix so we substitute explicitly here.
const interpolateEnvInHtml = () => ({
  name: 'varlock-html-interpolate',
  transformIndexHtml: {
    order: 'pre' as const,
    handler(html: string) {
      return html.replace(/%([A-Z][A-Z0-9_]*)%/g, (match, key: string) => {
        const value = process.env[key]
        return value !== undefined ? value : match
      })
    },
  },
})

export default defineConfig({
  plugins: [varlockVitePlugin(), interpolateEnvInHtml(), tailwindcss(), viteReact()],
  run: {
    tasks: {
      'env:typegen': {
        command: 'varlock typegen',
        cache: false,
      },
    },
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
})
