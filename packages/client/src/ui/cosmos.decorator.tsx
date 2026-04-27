import type { ReactNode } from 'react'

import { createFixturePorts } from '../adapters/fixture/index.tsx'
import { Providers } from '../providers.tsx'

import './styles.css'

/**
 * Cosmos decorator (ADR 0017). Auto-discovered by react-cosmos for every
 * fixture under `src/ui/**` because the file matches the
 * `**\/cosmos.decorator.{ts,tsx,js,jsx}` pattern and lives at or above
 * the fixture's path.
 *
 * Wraps every fixture with `<Providers ports={createFixturePorts()}>` so the
 * kernel's port discipline (RFC `oh-monorepo-6mn`) is the path of least
 * resistance — fixtures that need different seeds can override locally
 * (the inner `<Providers>` wins). Imports `@oh/client/ui/styles.css` so
 * Tailwind v4 tokens load (slice 1ob is the single source of truth).
 *
 * NOTE: this file lives inside `src/ui/**` and the slice-4ge oxlint
 * `no-restricted-imports` rule scopes its ban to `@sentry/*`, `@duckdb/*`,
 * `@cloudflare/*`, and `@tanstack/react-router` — all are concrete-infra
 * adapters. The kernel imports below (`Providers`, `createFixturePorts`)
 * are internal and not banned.
 */
export default function CosmosDecorator({ children }: { children: ReactNode }) {
  return <Providers ports={createFixturePorts()}>{children}</Providers>
}
