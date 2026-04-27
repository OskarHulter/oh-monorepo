---
'@oh/client': patch
---

feat(client): oxlint no-restricted-imports for ports & adapters discipline (slice 4ge)

Encodes the @oh/client ports & adapters discipline (RFC oh-monorepo-6mn) as an
oxlint `no-restricted-imports` rule scoped to `packages/client/src/ui/**`.
Banned: `@sentry/*`, `@duckdb/*`, `@cloudflare/*`, `@tanstack/react-router`.
Companion test (`packages/client/tests/oxlint-rule.test.ts`) spawns oxlint on
a deliberate-violation fixture to prove the rule fires.
