import { expect, test } from 'vite-plus/test'

import { createLogHandler } from '../src/index.ts'

test('barrel exports createLogHandler', () => {
  expect(typeof createLogHandler).toBe('function')
})
