# Cloudflare inventory + AWS↔CF mapping

> **Designated:** This is the **Cloudflare-only area**. All CF-native services and their adoption stages live here. Non-CF alternatives (Sentry / SigNoz / PostHog / Drizzle / Convex / etc.) live on their own tickets — do not duplicate CF service evaluations elsewhere.
>
> Tracked by `oh-monorepo-tfx`. Update in place as services come online or pricing changes; this file is a living reference, not an immutable decision.

## Why Cloudflare-first

- The compute / storage / network primitives sit close enough on CF that latency and ops overhead drop well below an AWS-equivalent stack at our scale.
- Workers + R2 + KV + Pages cover the website MVP without standing up a single VPC.
- Mapping AWS-shaped intuitions to CF equivalents up front makes the "where does this go?" question answerable in one lookup.

## CF-native tooling roster

Single source of truth. If a service is CF-native and we use or plan to use it, it appears here.

| Layer            | Service                                                             |
| ---------------- | ------------------------------------------------------------------- |
| Compute          | Workers, Containers, Durable Objects, Pages                         |
| Storage          | R2 (object), KV, D1 (SQLite), DO storage                            |
| Postgres pooling | Hyperdrive (to external Neon / Supabase)                            |
| Async            | Queues, Workflows, Pipelines (streaming ingest)                     |
| Data             | Analytics Engine, Vectorize                                         |
| AI               | Workers AI                                                          |
| Edge / Network   | Bot Management, Super Bot Fight Mode, Turnstile, WAF, Email Workers |
| Observability    | Logpush, Workers Observability, Trace Events                        |

IaC for CF lives on `oh-monorepo-fhi` (Terraform / OpenTofu vs Pulumi). Wrangler-only baseline until that ticket lands.

## AWS ↔ CF mapping with adoption stage

| AWS             | Cloudflare                                                 | Adoption stage                                      |
| --------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| CloudFormation  | Terraform / OpenTofu CF provider OR Pulumi (no native CFN) | when >2 services exist (tracked: `oh-monorepo-fhi`) |
| S3              | R2                                                         | **now** — parquet store + asset hosting             |
| Lambda          | Workers                                                    | **now**                                             |
| Lambda (heavy)  | Containers                                                 | when CPU / mem outgrow Workers                      |
| SQS             | Queues                                                     | first event-driven worker                           |
| SNS (fanout)    | Queues w/ multi-consumer; Email Workers; webhooks          | as needed                                           |
| CloudWatch      | Logpush + Analytics Engine + Workers Observability         | bridged to SigNoz (`oh-monorepo-2th`)               |
| WAF Bot Control | Bot Management (paid) + Super Bot Fight Mode + Turnstile   | when bot lane lights up (`oh-monorepo-y9a`)         |
| RDS / Aurora    | Neon / Supabase + Hyperdrive (no native managed PG)        | when Postgres needed                                |
| ElastiCache     | KV (eventually-consistent) or DO storage                   | per workload                                        |
| DynamoDB        | KV or D1 or DO storage                                     | small relational → D1                               |
| Step Functions  | Workflows                                                  | when multi-step batch arrives                       |
| Kinesis         | Pipelines                                                  | when streaming ingest from ML pipeline              |
| OpenSearch      | Vectorize (vector only) + ClickHouse for full-text         | per workload                                        |
| SageMaker       | Workers AI (small models)                                  | as needed                                           |

## Stage gates

Adoption is staged, not flipped. Each stage answers a workload need, not a checkbox.

1. **Now — website MVP.** Workers, R2, KV, Pages.
2. **First backend chunk.** Queues, Workflows, Hyperdrive (if Postgres lands), Drizzle on D1 (`oh-monorepo-4dn`).
3. **High-volume ingest.** Pipelines, Analytics Engine, Containers.
4. **Public API surface.** Unkey on Workers (`oh-monorepo-6iu`), WAF rules.
5. **Bot research lane.** Bot Management or Turnstile (`oh-monorepo-y9a`).

## Cross-references

- `oh-monorepo-fhi` — IaC for CF (Terraform / OpenTofu vs Pulumi); Wrangler-only is the baseline until then.
- `oh-monorepo-no7` — CF Pages deploy workflow with Infisical-injected env (Wrangler-from-CI).
- `oh-monorepo-2th` — SigNoz adoption (CF Logpush bridge target).
- `oh-monorepo-jn4` — Sentry (separate from CF observability).
- `oh-monorepo-4dn` — Drizzle ecosystem (D1 + Hyperdrive consumers).
- `oh-monorepo-y9a` — Bot research lane (Bot Management / Turnstile consumers).
- `oh-monorepo-ctc` — Convex vs Drizzle+Durable Objects spike.
- `oh-monorepo-b4b` — DuckDB-WASM local-first analytics behind login.
- `oh-monorepo-6iu` — API gateway + Unkey for public APIs.

## Open questions (resolve at adoption time, not now)

- Workers paid plan threshold and budget — verify usage projection before flipping to paid.
- R2 egress pricing model — confirm at adoption time; CF has changed this surface before.
- Container plan availability + cold-start budget — gate stage 3 adoption on a Container price/perf check.
- Analytics Engine retention vs SigNoz overlap — decide which is system of record before Logpush bridge ships.

## How to update this doc

- A service ships into a stage → move its row to **now** and note the date in the changelog below.
- A new CF service is evaluated → add a row, set the stage gate, link the cluster ticket.
- A non-CF alternative ships (e.g. Drizzle on Neon for Postgres) → keep it off this file; cross-link from the cluster ticket only.

## Changelog

- 2026-04-27 — Doc seeded from `oh-monorepo-tfx` notes. Stages 1–5 captured; no services in production yet beyond Pages target for the website MVP.
