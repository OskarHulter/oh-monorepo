import { defineConfig } from 'vite-plus'

/**
 * Root @oh/* monorepo lint config.
 *
 * The `lint.overrides[0]` block encodes the @oh/client ports & adapters
 * discipline (RFC oh-monorepo-6mn, slice oh-monorepo-4ge):
 *
 * - Files under `packages/client/src/ui/**` (which covers
 *   `src/ui/components/**` and `src/ui/features/**`) MUST NOT import
 *   `@sentry/*`, `@duckdb/*`, `@cloudflare/*`, or `@tanstack/react-router`.
 * - Concrete adapters live in `packages/client/src/adapters/fixture/**` and
 *   `apps/website/src/adapters/**`; both are intentionally outside the ban.
 *
 * Default `vp lint` runs do NOT trip on the fixture file at
 * `packages/client/tests/__fixtures__/oxlint-rule/banned-imports.tsx`: the
 * top-level `lint.ignorePatterns` excludes `**\/__fixtures__/**` so CI stays
 * green. The companion test (`packages/client/tests/oxlint-rule.test.ts`)
 * spawns the bundled `oxlint` CLI directly against the fixture with the same
 * rule config to prove the rule fires.
 *
 * Note on placement: vp lint v0.1.18 reads the `lint` block ONLY from the
 * monorepo root vite.config.ts (per-package vite.config.ts lint blocks are
 * ignored at runtime). The override's `files` glob is workspace-root
 * relative and points at `packages/client/src/ui/**`.
 *
 * GAP: raw `fetch('http://...')` URL literals are NOT enforced. oxlint
 * supports `no-restricted-imports` (covered above) and a small set of
 * static eslint rules but does NOT yet expose a full `no-restricted-syntax`
 * AST-selector rule. Revisit when oxlint ships it.
 */

const PORTS_ADAPTERS_BAN = {
  patterns: [
    {
      group: ['@sentry/*'],
      message:
        'ports & adapters (RFC oh-monorepo-6mn): src/ui/** must not import @sentry/*. Wire it through TelemetryPort in apps/website/src/adapters/.',
    },
    {
      group: ['@duckdb/*'],
      message:
        'ports & adapters (RFC oh-monorepo-6mn): src/ui/** must not import @duckdb/*. Wire it through DataPort in apps/website/src/adapters/.',
    },
    {
      group: ['@cloudflare/*'],
      message:
        'ports & adapters (RFC oh-monorepo-6mn): src/ui/** must not import @cloudflare/*. Wire it through DataPort/TelemetryPort in apps/website/src/adapters/.',
    },
    {
      group: ['@tanstack/react-router'],
      message:
        'ports & adapters (RFC oh-monorepo-6mn): src/ui/** must not import @tanstack/react-router. Wire it through RouterPort in apps/website/src/adapters/.',
    },
  ],
}

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
  lint: {
    // The slice 4ge fixture lives at `packages/client/tests/__fixtures__/`
    // and contains deliberate ports & adapters violations. It is excluded
    // from default `vp lint` / `vp check` here so CI stays green; the
    // companion test (`packages/client/tests/oxlint-rule.test.ts`) spawns
    // oxlint directly against it to prove the rule fires.
    ignorePatterns: ['dist/**', '**/__fixtures__/**'],
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ['packages/client/src/ui/**'],
        rules: {
          'no-restricted-imports': ['error', PORTS_ADAPTERS_BAN],
        },
      },
    ],
  },
  run: {
    cache: true,
  },
})
