import { expect, test } from 'vite-plus/test'

import { siteConfig } from '../src/site.config.ts'

test('siteConfig parses with expected shape', () => {
  expect(siteConfig.name).toBe('oh-monorepo')
  expect(siteConfig.url).toMatch(/^https?:\/\//)
  expect(siteConfig.locale).toBe('en-US')
})

test('main.ts applies siteConfig to document metadata', async () => {
  const app = document.createElement('div')
  app.id = 'app'
  document.body.replaceChildren(app)
  await import('../src/main.ts')

  expect(document.title).toBe(siteConfig.name)
  expect(document.documentElement.lang).toBe(siteConfig.locale)
  expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe(
    siteConfig.description,
  )
  expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
    siteConfig.themeColor,
  )
})
