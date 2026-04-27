import type { ThemePort } from '@oh/client'

function readSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const theme: ThemePort = {
  mode: readSystemMode(),
  toggle() {
    // No-op for slice 1ob; a full theme adapter lands with the theme feature.
  },
}
