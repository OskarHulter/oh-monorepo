import { expect, test } from 'vite-plus/test'

// Loading the stylesheet here makes the Tailwind compile chain part of the
// test surface — if Tailwind fails to process @import 'tailwindcss', the
// computed-style assertion below fails.
import '@oh/client/ui/styles.css'
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
  try {
    // flushSync forces React to commit synchronously so DOM assertions don't
    // depend on a setTimeout/microtask race (avoids timing-dependent flakes
    // under Playwright load).
    flushSync(() => {
      reactRoot.render(createElement(StrictMode, null, createElement(App)))
    })

    const heading = root.querySelector('h1')
    expect(heading?.textContent).toBe(siteConfig.name)

    const main = root.querySelector('main')
    expect(main?.className).toContain('min-h-screen')

    // Strong assertion: Tailwind generated CSS for `min-h-screen` AND it's
    // applied to the rendered element. Catches a broken Tailwind chain that
    // a className-only check would miss. getComputedStyle resolves `100vh`
    // to a pixel length, so compare against the live viewport height.
    expect(main).not.toBeNull()
    expect(parseFloat(getComputedStyle(main!).minHeight)).toBeCloseTo(window.innerHeight, 0)
  } finally {
    // Unmount so React state / effects / handlers don't leak into the next test
    // when running browser-mode suites in shared windows.
    reactRoot.unmount()
  }
})
