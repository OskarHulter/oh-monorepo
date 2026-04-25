# 0001. Validate env schema

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

Env vars are load-bearing across the monorepo — app config, log level, future secrets. Plain `.env` files give us `string | undefined` at best; the schema lives only in the developer's head. We need typed, validated env that is safe to consume at boundaries and shareable across apps.

## Decision Drivers

- Types at the boundary (TS-level `ENV.*`), not deep inside the code
- Fail-fast on missing or malformed vars — no silent `undefined`
- One schema reused across apps; no per-app copy-paste
- Dev-server HMR + build-time leak protection

## Considered Options

- Plain `.env` + ad-hoc `process.env` reads
- `dotenv` + hand-rolled Zod validation in each consumer
- `@t3-oss/env-core` (Zod-based, opinionated)
- `varlock` with `@varlock/vite-integration`

## Decision Outcome

Chosen option: **varlock**, because it combines schema-driven env, type generation, monorepo composition (`@import`), and a Vite plugin for HMR + leak redaction — covering every driver in one package.

### Positive Consequences

- Single source of truth in `.env.schema`; `ENV.*` typed via generated `src/env.d.ts`
- Shared vars in root schema; app-specific via `@import(../../.env.schema)`
- Validation and leak-scanning via `varlock load` / `varlock scan`

### Negative Consequences

- Schema dialect is bespoke (decorator comments); `@` in freeform text is reserved
- Decorators (`@defaultSensitive`, `@defaultRequired`) don't cross `@import` — restated per consumer

## Pros and Cons of the Options

### Plain `.env`

- Good, because zero tooling
- Bad, because every consumer reinvents parsing and validation

### `dotenv` + Zod in code

- Good, because Zod is already in the repo (ADR 0004)
- Bad, because each app maintains its own boilerplate; no schema composition; no leak protection

### `@t3-oss/env-core`

- Good, because Zod-native and well-known
- Bad, because Next.js-shaped; no native monorepo composition; no build-time leak tooling

### varlock

- Good, because schema doubles as documentation, types, and validator
- Good, because `@import` composes across workspace packages
- Bad, because newer tool — smaller community, moving surface
