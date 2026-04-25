import { defineConfig } from 'vite-plus'

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    ignorePatterns: ['dist/**'],
    singleQuote: true,
    semi: false,
    sortPackageJson: true,
    sortImports: true,
  },
  lint: { options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
})
