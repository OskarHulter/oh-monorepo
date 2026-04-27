# 0013. Adopt Better-Auth as the code-owned auth provider; defer WorkOS

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

The portfolio repo needs an auth provider before the first authenticated workload (user accounts / sessions) lands. The choice has to clear CF Workers at runtime, fit the schema-first Drizzle workflow ratified in ADR 0009, and not lock us into a per-MAU pricing curve we cannot exit. Hosted SSO/SCIM/Audit-Logs are not the day-one need — those are WorkOS territory and only earn their weight at the first paying enterprise.

## Decision Drivers

- **Code-owned vs hosted.** Sessions, schema, and migrations live in our repo so the auth surface evolves with the rest of the SQL layer (ADR 0009), not behind a vendor console.
- **Lock-in cost.** No per-MAU pricing curve, no hosted UI we cannot replace, no data we cannot export.
- **CF Workers compatibility.** Verified at runtime — the auth library has to run in the Workers binding model without Node-only shims.
- **Drizzle integration.** First-class adapter so the auth schema lives next to the rest of the workload schemas (`packages/server/db/schema.ts`) and migrates through the same `drizzle-kit generate` workflow.
- **Passkey + 2FA OOTB.** Not a follow-up plugin scramble; both ship in the core today.
- **OAuth coverage.** GitHub minimum for the portfolio surface; Google as a second provider when needed. Both are first-class.
- **Account-linking story.** Multiple OAuth providers + passkey on one user record without a bespoke merge layer.
- **Reversibility.** Easy to fall back to Auth.js on the same Drizzle schema, or to lift-and-shift to WorkOS when SSO/SCIM/Audit-Logs become the deciding workload.

## Considered Options

- **A. Better-Auth** — TS-first, code-owned, Drizzle adapter, passkey + 2FA + OAuth in core, edge-friendly.
- **B. Clerk** — hosted UI + sessions, ~10k MAU free, fast DX, lock-in cost climbs with usage.
- **C. Auth.js** (NextAuth lineage) — OSS, OAuth-heavy, edge runtime has known quirks; no first-class passkey story without plugin glue.
- **D. WorkOS** — enterprise SSO/SCIM/Audit-Logs surface; deferred until a paying enterprise need.

## Decision Outcome

Chosen option: **A — Better-Auth**. Adopt at the framework level. Defer the actual scaffold + sign-in spike to follow-up tickets so this PR stays research-only. WorkOS stays parked behind a workload that justifies it.

The session-storage backend (D1 vs Neon+Hyperdrive vs Turso) is **not** decided here — it is the first workload that lands the per-workload DB pick in [`docs/infra/drizzle-database-targets.md`](../infra/drizzle-database-targets.md) (user-accounts row, currently leaning D1, gated on this ticket).

### Positive Consequences

- Auth schema flows through the same Drizzle workflow as every other workload — no bespoke pipeline.
- Passkey + TOTP available without a plugin scavenger hunt; matches the trust-boundary spirit of ADR 0004.
- CF Workers is the deployment target, not an afterthought — no Node polyfill compatibility tax.
- Account linking + multi-provider sign-in is a config flag, not a custom merge worker.
- Falling back to Auth.js (same Drizzle schema, different lib) is a contained change; switching to WorkOS is a separate, deliberate ADR.

### Negative Consequences

- Better-Auth is younger than Auth.js and Clerk; some edge cases (custom OAuth providers, exotic flows) may need patches upstream or workarounds.
- We own the UI surface (sign-in, sign-up, recovery, account management) — Clerk would have shipped these for us. The portfolio scope makes this affordable; an enterprise scope would not.
- Email + magic-link delivery still needs a transactional email pick (separate cluster, not in scope here).
- No SSO/SCIM/Audit-Logs out of the box. When that arrives, WorkOS is the planned escape hatch — not a Better-Auth extension.

## Pros and Cons of the Options

### A. Better-Auth

- Good, code-owned — schema, sessions, migrations live in the repo with the rest of Drizzle.
- Good, first-class Drizzle adapter; auth tables sit next to workload tables.
- Good, passkey + 2FA + OAuth all in core, no plugin glue for the day-one scope.
- Good, edge-friendly — designed for the Workers / serverless runtime.
- Good, account-linking + multi-provider via config, not a custom merge step.
- Bad, smaller ecosystem than Auth.js; fewer community recipes.
- Bad, we own the UI; designing sign-in / recovery / account flows is on us.

### B. Clerk

- Good, hosted UI components ship a working sign-in flow in an afternoon.
- Good, generous free tier for early-stage usage (~10k MAU).
- Bad, per-MAU pricing curve becomes a recurring cost we can't fully predict.
- Bad, sessions + identity live in Clerk's data plane — exit cost is real.
- Bad, the DX gain duplicates work we're already doing in Drizzle (schema-first, migrations checked in).

### C. Auth.js

- Good, mature OSS, large community, broadest OAuth provider coverage.
- Bad, edge runtime has known compatibility quirks; we'd debug Workers-specific issues we don't want to debug now.
- Bad, passkeys are not first-class; relies on community plugins with uneven maintenance.
- Bad, schema/adapter story is less ergonomic than Better-Auth + Drizzle.

### D. WorkOS

- Good, enterprise SSO/SCIM/Audit-Logs are the product, not a feature flag.
- Bad, no day-one workload needs them; paying for shelfware.
- Bad, the auth surface for individual users is not the strength — solves a different problem.

## Implementation Notes

This ADR ratifies the pick. **No code lands in this PR.** Follow-up spike tickets do the actual scaffold and the runtime verification:

- Spike: scaffold Better-Auth + Drizzle + D1 in `apps/website` (P3, follow-up).
- Spike: sign-in flow + session round-trip in a CF Worker (P3, follow-up).
- Decision: confirm Better-Auth adoption after spikes, or fall back (P2, follow-up).

The living evaluation matrix lives in [`docs/infra/auth-evaluation.md`](../infra/auth-evaluation.md) — candidate-by-decision-point table, spike checklist, open questions, cross-references. Update that doc as spikes resolve; do not edit this ADR.

## Cross-references

- [ADR 0009](0009-adopt-drizzle-as-sql-layer.md) — frames the SQL layer that Better-Auth's adapter binds to.
- [ADR 0004](0004-validate-trust-boundaries.md) — passkey + 2FA align with the trust-boundary direction.
- `oh-monorepo-4dn` — Drizzle database targets; user-accounts row is gated on this ADR.
- `oh-monorepo-te9` — this ADR's tracking ticket; closed when this PR lands.
- [`docs/infra/auth-evaluation.md`](../infra/auth-evaluation.md) — living matrix + spike checklist.
- [`docs/infra/drizzle-database-targets.md`](../infra/drizzle-database-targets.md) — session-storage pick lives here, not in this ADR.
