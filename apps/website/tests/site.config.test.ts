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

  const [{ createRoot }, { flushSync }, { App }, { StrictMode, createElement }] = await Promise.all(
    [import('react-dom/client'), import('react-dom'), import('../src/app.tsx'), import('react')],
  )

  const reactRoot = createRoot(root)
  // flushSync forces React to commit synchronously so DOM assertions don't
  // depend on a setTimeout/microtask race (avoids timing-dependent flakes
  // under Playwright load).
  flushSync(() => {
    reactRoot.render(createElement(StrictMode, null, createElement(App)))
  })

  const heading = root.querySelector('h1')
  expect(heading?.textContent).toBe(siteConfig.name)

  const main = root.querySelector('main')
  // Tailwind v4 utility class survived the build chain
  expect(main?.className).toContain('min-h-screen')
})
