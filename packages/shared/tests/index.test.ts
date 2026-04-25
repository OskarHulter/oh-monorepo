import { expect, test } from 'vite-plus/test'

import { websiteSchema } from '../src/index.ts'

test('websiteSchema accepts valid metadata', () => {
  const parsed = websiteSchema.parse({
    name: 'Example',
    url: 'https://example.com',
  })
  expect(parsed.locale).toBe('en-US')
})

test('websiteSchema rejects bad url', () => {
  expect(() => websiteSchema.parse({ name: 'Example', url: 'not-a-url' })).toThrow()
})
