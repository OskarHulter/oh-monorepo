# 0009. Adopt Drizzle (ORM + Kit + Studio) as the SQL layer; defer per-workload DB picks

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

Backend workloads are coming (auth, wiki, portfolios, scanner, audit). They all need a type-safe SQL layer with a coherent migration story, but they will not all want the same database — some are low-write SQLite-shaped, some need Postgres transactions and JSON. What's the smallest commitment that unlocks the framework decision without prematurely locking each workload to a database?

## Decision Drivers

- TypeScript-first ergonomics. Schema → types → compile-time errors at every consumer when the schema moves.
- Multi-dialect: the same ORM has to drive D1 (SQLite at CF) **and** Neon+Hyperdrive (Postgres) without forcing a rewrite when a workload changes target.
- Migration story is checked in, deterministic, applied on deploy. No "click in a console."
- Plays with Better-Auth (`oh-monorepo-te9`) since auth is the first workload likely to land.
- Cost: zero recurring spend at the framework layer. Database costs are per-workload, decided when the workload ships.

## Considered Options

- **A. Drizzle ORM + Kit + Studio**, dialect chosen per workload.
- **B. Prisma**, dialect chosen per workload.
- **C. Kysely** (query builder, no ORM).
- **D. Hand-rolled SQL + a thin types codegen.**
- **E. Defer the framework choice** until the first workload is implementation-ready.

## Decision Outcome

Chosen option: **A — Drizzle**. Adopt now at the framework level. Defer per-workload database picks (D1 vs Neon+Hyperdrive vs Turso) to the workload tickets — each gets its own decision with the matrix in `docs/infra/drizzle-database-targets.md` as the starting point.

### Positive Consequences

- Schema-first workflow: edit `schema.ts` → `drizzle-kit generate` → typecheck flags every site that needs to change.
- One ORM spans D1 + Postgres + Turso. A workload that outgrows D1 doesn't force a query-layer rewrite — only dialect + migration runner change.
- Drizzle Studio replaces ad-hoc DB browsing without a server-hosted dashboard.
- Better-Auth has a first-class Drizzle adapter, so the auth workload doesn't need a bespoke wiring layer.
- Per-workload deferral means we don't pay D1 vs Neon+Hyperdrive cost-modeling now for workloads that are still hypothetical.

### Negative Consequences

- Drizzle is younger than Prisma; some edge cases (complex joins, Postgres-specific features) need workarounds.
- Multi-dialect support is not free — sharing one schema file across SQLite + Postgres requires care (column types, defaults, JSON shape).
- Studio is dev-only; production introspection still needs whatever the underlying DB ships.

## Pros and Cons of the Options

### A. Drizzle

- Good, schema-first with TS as the source of truth — no `.prisma` DSL.
- Good, multi-dialect under one API — D1 + Postgres + Turso without a rewrite.
- Good, Better-Auth integration ready.
- Bad, smaller ecosystem than Prisma; complex Postgres features sometimes need raw SQL.

### B. Prisma

- Good, mature, large ecosystem, excellent docs.
- Bad, separate `.prisma` schema language adds a translation layer the team has to learn.
- Bad, Prisma Accelerate / Data Proxy story is awkward on CF Workers; bundle size is higher than Drizzle.
- Bad, migration story is more rigid; harder to drop into an existing DB.

### C. Kysely

- Good, lightweight, type-safe query builder.
- Bad, no migration tooling — we'd add one separately, defeating the "framework decision" framing.
- Bad, no schema-as-source-of-truth; types are derived from a separate generator.

### D. Hand-rolled SQL + types codegen

- Good, zero abstraction tax.
- Bad, every workload reinvents migrations, query helpers, type generation.
- Bad, no ergonomic story for Better-Auth or future Drizzle-shaped libraries.

### E. Defer framework choice

- Good, ships zero now.
- Bad, the first workload (auth) needs a query layer immediately; deferring means making the call under deadline pressure with worse information.

## Implementation Notes

- Repo layout once a workload lands:
  - `packages/server/db/schema.ts` — single source of truth.
  - `packages/server/db/migrations/` — checked-in, generated via `drizzle-kit generate`.
  - Apply on deploy: `wrangler d1 migrations apply` for D1, `psql` for Postgres.
- Workflows:
  - Schema-first: edit schema → regenerate types → compiler flags every consumer to update.
  - Drizzle Studio for ad-hoc queries.
  - Pair with Better-Auth Drizzle adapter (`oh-monorepo-te9`).
- Per-workload database picks: see `docs/infra/drizzle-database-targets.md`. Each workload ships with its own follow-up ticket when implementation starts.

## Follow-ups (one ticket each, filed against this ADR)

- Pick DB target for **user accounts / sessions** workload — gated on Better-Auth (`oh-monorepo-te9`).
- Pick DB target for **wiki / docs metadata** workload.
- Pick DB target for **portfolios / watchlists** workload.
- Pick DB target for **scanner results** workload.
- Pick DB target for **audit log** workload.
