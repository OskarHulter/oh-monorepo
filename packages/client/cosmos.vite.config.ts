import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Plain-Vite config for the react-cosmos sandbox (ADR 0017).
 *
 * Why a separate file from `vite.config.ts`:
 * - `vite.config.ts` uses `vite-plus`'s `defineConfig` to drive `vp pack`
 *   (library build via tsdown), which adds `pack`, `lint`, `fmt`, `staged`
 *   keys that vanilla Vite (used by `react-cosmos-plugin-vite`) ignores or
 *   chokes on.
 * - Cosmos's vite renderer (`react-cosmos-plugin-vite`) calls vanilla
 *   `createServer`. It needs `@vitejs/plugin-react` for JSX + Fast Refresh
 *   and `@tailwindcss/vite` for Tailwind v4 token loading off
 *   `src/ui/styles.css`.
 *
 * Cross-references:
 * - `cosmos.config.json` points `vite.configPath` at this file.
 * - `cosmos.decorator.tsx` imports `@oh/client/ui/styles.css`; the Tailwind
 *   plugin here is what compiles that import.
 */
export default defineConfig({
  plugins: [viteReact(), tailwindcss()],
})
