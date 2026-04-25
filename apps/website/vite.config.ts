import { varlockVitePlugin } from '@varlock/vite-integration'
import { defineConfig } from 'vite-plus'
import { playwright } from 'vite-plus/test/browser-playwright'

export default defineConfig({
  plugins: [varlockVitePlugin()],
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
