import tailwindcss from '@tailwindcss/vite'
import { varlockVitePlugin } from '@varlock/vite-integration'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

// Interpolate %SITE_*% placeholders in index.html at transform time. Vite's
// built-in %VAR% interpolation only handles VITE_*-prefixed names; varlock's
// SITE_* schema lives outside that prefix.
//
// Hardening:
// - Regex restricted to %SITE_*%; arbitrary placeholders (e.g. %PATH%,
//   %HOME%) are left as literals so typos surface in dist/index.html
//   instead of leaking unrelated env.
// - Values are HTML-attribute-escaped before substitution.
// - Unset / empty values emit an empty string.
//
// Source of truth: process.env. `varlockVitePlugin()` runs first in the
// plugin chain (see `plugins:` order below) and populates process.env with
// the schema-resolved values — including .env.schema defaults — before any
// transformIndexHtml hook fires. Verified at build time: dist/index.html
// contains the resolved siteConfig.name + description + OG metadata even
// when the corresponding shell env vars are unset locally.
//
// Sourcing from `varlock/env` directly was attempted; the ENV proxy
// intercepts `.then` access during dynamic-import resolution and breaks the
// async build. process.env is the working seam.

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
      return html.replace(/%(SITE_[A-Z0-9_]*)%/g, (_match, key: string) => {
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
    setupFiles: ['./tests/setup-varlock.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
})
