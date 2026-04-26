import { expect, test } from 'vite-plus/test'

import { siteConfig } from '../src/site.config.ts'

test('siteConfig parses with expected shape', () => {
  expect(siteConfig.name).toBe('oh-monorepo')
  expect(siteConfig.url).toMatch(/^https?:\/\//)
  expect(siteConfig.locale).toBe('en-US')
})

test('App renders siteConfig name with a Tailwind utility class applied', async () => {
  const root = document.createElement('div')
  root.id = 'app'
  document.body.replaceChildren(root)

  const [{ createRoot }, { App }, { StrictMode, createElement }] = await Promise.all([
    import('react-dom/client'),
    import('../src/app.tsx'),
    import('react'),
  ])

  createRoot(root).render(createElement(StrictMode, null, createElement(App)))

  // Wait one microtask + one task tick for React 19 to flush
  await new Promise((resolve) => setTimeout(resolve, 0))

  const heading = root.querySelector('h1')
  expect(heading?.textContent).toBe(siteConfig.name)

  const main = root.querySelector('main')
  // Tailwind v4 utility class survived the build chain
  expect(main?.className).toContain('min-h-screen')
})
