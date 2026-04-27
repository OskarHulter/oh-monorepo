# Auth stack — candidate evaluation matrix

> **Designated:** This is the **auth-stack area**. Candidate evaluation, spike status, and open questions live here. The pick (Better-Auth) is ratified in [ADR 0013](../adr/0013-adopt-better-auth.md).
>
> Tracked by `oh-monorepo-te9`. Update in place as spikes resolve; this file is a living reference, not an immutable decision.

## Why code-owned auth

- Auth schema lives next to workload schema in Drizzle (ADR 0009) — one migration story, one type-safe surface.
- No per-MAU pricing curve; cost is the database row plus whatever we pay for transactional email.
- CF Workers is the runtime target; the auth library has to fit the binding model, not fight it.
- Passkey + 2FA in core is the trust-boundary baseline (ADR 0004 spirit) — not a plugin we have to maintain.
- WorkOS is the deliberate escape hatch when SSO/SCIM/Audit-Logs become the deciding workload, not a feature we bolt onto Better-Auth.

## Candidate matrix

Lean is the proposed pick (Better-Auth, ratified). **Committed?** stays `No` for the day-one workload until the spikes below land.

| Candidate       | Storage                                                | Passkey + 2FA                 | OAuth (GH / Google) | CF Workers compat                                     | Account linking           | Lock-in                  | Cost shape                                      | Committed?               |
| --------------- | ------------------------------------------------------ | ----------------------------- | ------------------- | ----------------------------------------------------- | ------------------------- | ------------------------ | ----------------------------------------------- | ------------------------ |
| **Better-Auth** | Drizzle adapter — D1 / Postgres / Turso (per workload) | Both first-class in core      | Both first-class    | Designed for it; verify at runtime in spike           | Multi-provider via config | Low — schema is ours     | DB rows + transactional email                   | Lean (ratified ADR 0013) |
| Clerk           | Hosted (Clerk data plane)                              | Both, hosted UI               | Both first-class    | Yes — middleware + SDK                                | Yes (in Clerk console)    | High — sessions in Clerk | Free ~10k MAU; per-MAU above; rises with use    | No                       |
| Auth.js         | Drizzle adapter (and others)                           | Plugin / community, not core  | Both first-class    | Edge runtime quirks; needs Workers-specific debugging | Yes (configurable)        | Low — schema is ours     | DB rows + transactional email                   | No                       |
| WorkOS          | Hosted (WorkOS data plane)                             | 2FA yes; passkeys via AuthKit | Both via AuthKit    | Yes — REST + SDK                                      | Yes (Directory Sync)      | High — enterprise-tier   | Free dev tier; per-connection / per-org pricing | Deferred (not day-one)   |

`committed` means the pick is in production for at least one workload. Until then, "Lean" is a starting point, not a decision.

## Decision points (per [bd ticket te9](#cross-references))

These are the questions the spike has to answer. Each becomes a row in the changelog as it resolves.

1. **Session storage backend.** D1 vs Neon+Hyperdrive vs Turso. Decided on the user-accounts row of [`drizzle-database-targets.md`](drizzle-database-targets.md) — currently leaning D1. Will be flipped to `committed` when the first spike lands.
2. **Passkey + 2FA support out-of-box.** Better-Auth ships both in core; verify the WebAuthn ceremony round-trips in a Worker before committing.
3. **OAuth providers needed.** GitHub minimum for the portfolio. Google as a second provider when the use case justifies it (e.g. consumer-friendly sign-in). Both are first-class in Better-Auth — no plugin work expected.
4. **CF Workers compatibility verified at runtime.** No bundler errors; cookies + Set-Cookie work through the Workers Response surface; KV/DO not required for sessions if D1 is the target. Validated in the second spike.
5. **Account merge / linking story.** Multiple OAuth providers + passkey on one user record. Better-Auth supports this via config; verify the merge UX (link vs new account) before committing.

## Spike checklist

Per ticket `oh-monorepo-te9`. Each item becomes its own follow-up ticket; this list is the spec, not the tracker.

- [ ] **Spike A — Scaffold.** Better-Auth + Drizzle + D1 in `apps/website`. Schema generates; migration runs; Drizzle Studio shows the auth tables. P3 follow-up.
- [ ] **Spike B — Sign-in round-trip.** GitHub OAuth start → callback → session cookie → authenticated request → sign-out, all in a CF Worker. P3 follow-up.
- [ ] **Spike C — DX comparison.** 5-minute test of Clerk hosted DX side-by-side. Document the DX delta vs the lock-in tradeoff. (Not its own ticket — folded into Spike A's notes.)
- [ ] **Decision.** Adopt / extend spike / fall back. P2 follow-up; gates the user-accounts DB pick on `oh-monorepo-4dn`.

## Out of scope

- SSO / SCIM / Audit Logs — WorkOS territory; revisit at first paying enterprise.
- Transactional email provider (magic links, recovery, verification) — separate cluster, not part of this evaluation.
- Authorization / RBAC / ABAC — auth (who you are) is not authz (what you can do). Authz lives on its own ticket once a workload requires it.
- B2B org / team / invite primitives — a Better-Auth plugin exists, but the day-one scope does not need them.

## Open questions (resolve at adoption time, not now)

- **Session-cookie domain across subdomains.** When apps split across `apps/website` and a future API surface, do we share cookies via parent-domain scope, or run separate sessions per surface? Decide at the second authenticated workload, not the first.
- **Future SSO/SCIM gating.** Define the trigger that flips us to WorkOS — first paying enterprise? First customer who asks? Document the answer in the WorkOS ADR when it's filed, not here.
- **Email delivery.** Resend vs Postmark vs SES vs Loops — separate evaluation, gated on the first email-sending workload (likely magic-link sign-in or recovery).
- **Rate-limit / abuse story.** Better-Auth ships basic limits; verify whether we need Turnstile in front of the sign-in surface (cross-ref `oh-monorepo-y9a` bot lane).
- **Account-deletion / data-export UX.** Required for GDPR-shaped workloads; design once we have the first authenticated workload running.

## Cross-references

- [ADR 0013](../adr/0013-adopt-better-auth.md) — ratifies Better-Auth as the pick.
- [ADR 0009](../adr/0009-adopt-drizzle-as-sql-layer.md) — frames the SQL layer Better-Auth binds to.
- [ADR 0004](../adr/0004-validate-trust-boundaries.md) — passkey + 2FA align with the trust-boundary direction.
- [`drizzle-database-targets.md`](drizzle-database-targets.md) — user-accounts row carries the session-storage pick.
- [`cloudflare-inventory.md`](cloudflare-inventory.md) — D1, Workers, KV, Durable Objects all live here.
- `oh-monorepo-te9` — auth evaluation cluster; this doc is its living artifact.
- `oh-monorepo-4dn` — Drizzle database targets; user-accounts pick is gated on the spike outcome.

## How to update this doc

- A spike resolves → flip the matching checklist item to `[x]` and note the date in the changelog.
- A new candidate is evaluated → add a row to the candidate matrix; document why it earned a row.
- A decision point is settled → cross-link to the closing ticket / ADR; do not edit history.
- Better-Auth gets dropped → flip its **Committed?** column, add a row for the replacement, file a superseding ADR. Do not delete history.

## Changelog

- 2026-04-27 — Doc seeded from `oh-monorepo-te9` notes alongside ADR 0013. Better-Auth ratified at the framework level; spikes pending; user-accounts session-storage pick (D1 lean) gated on Spike B.
