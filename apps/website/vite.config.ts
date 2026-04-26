import tailwindcss from '@tailwindcss/vite'
import { varlockVitePlugin } from '@varlock/vite-integration'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// Interpolate %SITE_*% placeholders in index.html from process.env at
// transform time. Vite's built-in %VAR% interpolation only handles VITE_*
// prefixed names; varlock's SITE_* schema lives outside that prefix.
//
// Hardening:
// - Allowlist of SITE_* keys; arbitrary %X% (e.g. %PATH%, %HOME%) is left as
//   a literal placeholder, which surfaces in dist/index.html as a typo signal.
// - Values are HTML-attribute-escaped before substitution to avoid
//   quote/angle-bracket injection.
// - Optional vars that are unset emit an empty string. The wrapping <meta>
//   tag still ships with empty content; pruning empty tags is left for a
//   future iteration if SEO testing flags it.
const SITE_ENV_KEYS = new Set([
  'SITE_NAME',
  'SITE_URL',
  'SITE_DESCRIPTION',
  'SITE_LOCALE',
  'SITE_THEME_COLOR',
])

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const interpolateEnvInHtml = () => ({
  name: 'varlock-html-interpolate',
  transformIndexHtml: {
    order: 'pre' as const,
    handler(html: string) {
      return html.replace(/%([A-Z][A-Z0-9_]*)%/g, (match, key: string) => {
        if (!SITE_ENV_KEYS.has(key)) return match
        const value = process.env[key]
        if (value === undefined || value === '') return ''
        return escapeHtmlAttribute(value)
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
