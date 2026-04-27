import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test'

/**
 * Slice oh-monorepo-4ge — proves the ports & adapters discipline lint rule
 * (RFC oh-monorepo-6mn) actually fires.
 *
 * The rule lives in the monorepo root vite.config.ts (vp lint reads its `lint`
 * block only from there in v0.1.18). The fixture file at
 * `tests/__fixtures__/oxlint-rule/banned-imports.tsx` contains deliberate
 * imports of every banned package; the production override scopes the rule to
 * `packages/client/src/ui/**` and the fixture is excluded from default
 * `vp lint` via `lint.ignorePatterns: ['**\/__fixtures__/**']`.
 *
 * To verify the rule fires on the fixture, this test spawns the bundled
 * `oxlint` CLI directly (Node-resolved) with a minimal config that mirrors the
 * production rule, pointed at the fixture. We assert:
 *   1. exit code is non-zero
 *   2. all four banned packages are reported
 *
 * Then we re-run oxlint with the violations stripped (a temp clean copy of the
 * fixture) and assert exit code is zero — proving "removing the violation
 * makes the lint pass" (slice 4ge AC).
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = resolve(__dirname, '..')
const FIXTURE_PATH = resolve(PACKAGE_ROOT, 'tests/__fixtures__/oxlint-rule/banned-imports.tsx')

/**
 * Resolve oxlint's CLI entry point via the bundled `vite-plus` install. We
 * cannot `require.resolve('oxlint/dist/cli.js')` directly because the test's
 * own package does not list `oxlint` as a dependency (Vite+ wraps it). The
 * monorepo CLAUDE.md forbids installing oxlint as a direct dependency, so we
 * resolve it through `vite-plus` instead — that's the same install path
 * `vp lint` itself uses (see vite-plus/dist/bin.js `lint()`).
 *
 * `oxlint`'s package.json `exports` map does not expose `./dist/cli.js`, so
 * we resolve `oxlint/package.json` and derive the CLI path from its dirname.
 */
const require_ = createRequire(import.meta.url)
const VITE_PLUS_PKG = require_.resolve('vite-plus/package.json')
const OXLINT_PKG = require_.resolve('oxlint/package.json', { paths: [VITE_PLUS_PKG] })
const OXLINT_CLI = join(dirname(OXLINT_PKG), 'dist', 'cli.js')

const RULE_CONFIG = {
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          { group: ['@sentry/*'] },
          { group: ['@duckdb/*'] },
          { group: ['@cloudflare/*'] },
          { group: ['@tanstack/react-router'] },
        ],
      },
    ],
  },
}

let workDir: string
let configPath: string

beforeAll(() => {
  workDir = mkdtempSync(join(tmpdir(), 'oh-client-oxlint-rule-'))
  configPath = join(workDir, '.oxlintrc.json')
  writeFileSync(configPath, JSON.stringify(RULE_CONFIG))
})

afterAll(() => {
  rmSync(workDir, { recursive: true, force: true })
})

function runOxlint(targetPath: string): { status: number | null; stderr: string; stdout: string } {
  const result = spawnSync(
    process.execPath,
    [OXLINT_CLI, '-c', configPath, '--no-ignore', targetPath],
    { encoding: 'utf-8' },
  )
  return {
    status: result.status,
    stderr: result.stderr ?? '',
    stdout: result.stdout ?? '',
  }
}

describe('@oh/client: ports & adapters discipline (oxlint rule)', () => {
  test('the violation fixture is flagged for every banned package', () => {
    const { status, stdout, stderr } = runOxlint(FIXTURE_PATH)
    const output = stdout + stderr

    expect(status).not.toBe(0)
    expect(output).toContain("'@sentry/react' import is restricted")
    expect(output).toContain("'@tanstack/react-router' import is restricted")
    expect(output).toContain("'@duckdb/wasm' import is restricted")
    expect(output).toContain("'@cloudflare/workers-types' import is restricted")
  })

  test('removing the banned imports makes the lint pass', () => {
    const cleanPath = join(workDir, 'banned-imports.tsx')
    writeFileSync(
      cleanPath,
      [
        '// banned imports stripped: rule must NOT fire when there are no violations.',
        'export const violations = {}',
        '',
      ].join('\n'),
    )
    const { status, stdout, stderr } = runOxlint(cleanPath)
    const output = stdout + stderr

    expect(status).toBe(0)
    expect(output).not.toContain('no-restricted-imports')
  })
})
