# 0012. Infisical as the secrets source-of-truth (via varlock)

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

ADR 0001 settled how env values are validated (varlock + `.env.schema`). It did not settle where the values come from. Today they sit in untracked `.env` files locally, would land in GitHub Actions secrets in CI, and would be `wrangler secret put` blobs in prod — three different stores, no single rotation surface, no audit trail. Where does the secret value come from across local / CI / prod, and how do we keep the three views in sync without hand-rolling the choreography?

## Decision Drivers

- Single source of truth — rotate once, propagate everywhere; no copy-paste between dashboards
- Plays with varlock — the schema layer from ADR 0001 stays the validator; the source plugs into it
- Cloudflare Workers compatible — prod consumers are Workers/Pages (`oh-monorepo-no7`); secrets must arrive as wrangler-bound env at deploy time
- Free-tier viable — solo project budget; no recurring spend at this scale
- Lift-friendly — the private chart project already runs Infisical; reuse the proven helpers instead of relearning a new tool
- Audit + scoping — per-path read scopes for client-readable vs server-only vars; rotation traceable

## Considered Options

- **A. Infisical via varlock plugin** (with `infisical secrets get` shell-out as constraint-fallback)
- **B. Doppler** (managed secrets, generous free tier)
- **C. HashiCorp Vault** (self-hosted, full-featured)
- **D. 1Password** (already in personal use)
- **E. GitHub Actions secrets only** + `.env` locally (no central store)

## Decision Outcome

Chosen option: **A — Infisical, accessed via varlock's plugin path; shell-out to `infisical secrets get` for any constraint the plugin can't carry**.

Infisical becomes the single source of truth for secret values across all three environments. Varlock (ADR 0001) remains the validator and consumer-facing surface — `ENV.*` is still typed and fail-fast, the `.env.schema` is still the contract. Infisical does not replace varlock; it feeds it. Items in the schema flagged with `@sensitive` are resolved from Infisical at load time; non-sensitive items continue to come from `.env` files as before.

The chart project already runs this exact pattern with helpers we trust. Lifting them is cheaper than re-evaluating the space, and ships with audit logs + per-path scoping out of the box. 1Password is skipped explicitly — its CI story (`op run --`) works but adds a second secrets surface alongside Infisical for no benefit.

The detailed adoption plan, per-environment matrix, and init flow live in [`docs/infra/secrets-adoption-plan.md`](../infra/secrets-adoption-plan.md). Follow-up tickets carry the wiring work; this ADR ratifies the choice only.

### Positive Consequences

- Rotation is one action: change in Infisical → CI redeploy → varlock validates the new value at load. No hand-syncing GitHub secrets, no `wrangler secret put` from a laptop.
- Per-environment Infisical paths give us scoped service tokens — CI gets read on the prod path, local dev gets read on the dev path, neither sees the other.
- Audit log is centralized; "who changed `STRIPE_KEY` last?" has one answer instead of three.
- Schema-as-contract still rules: a missing or malformed secret fails varlock load before it ever hits a Worker cold start.
- Lift from chart project means proven helpers, not greenfield wiring.

### Negative Consequences

- Free tier limits — caps on users / environments / secret count. We fit today; revisit if collaborators or projects multiply.
- Vendor lock-in to Infisical's API surface; the plugin abstracts most of it but not all. Mitigated by varlock's source-agnostic schema — switching providers is a plugin swap, not a schema rewrite.
- Rotation choreography on Cloudflare Workers needs a deploy-time `wrangler secret put` step (Workers don't read from Infisical at runtime). One extra step in the deploy workflow, tracked under `oh-monorepo-no7` and `oh-monorepo-lwb`.
- Service-token compromise = read access to the scoped path until rotated. Standard hygiene: rotate tokens on suspected compromise, scope tightly.
- Drift risk: Infisical and `.env.schema` are decoupled — adding a secret in one without the other breaks load. Mitigated by the nightly drift-detection workflow (`oh-monorepo-frr`).

## Pros and Cons of the Options

### A. Infisical via varlock plugin

- Good, single source feeds local + CI + prod through the same `varlock load` path
- Good, plugin path matches ADR 0001 — no second consumer-facing layer
- Good, free tier covers a solo project; chart project has already de-risked it
- Good, shell-out fallback (`infisical secrets get …`) covers anything the plugin can't carry
- Bad, free-tier ceiling exists; would need paid plan or self-host if the project grows
- Bad, deploy-time push to Workers is an extra step in CI

### B. Doppler

- Good, mature managed service; clean CLI; per-environment configs
- Bad, no first-class varlock plugin — we'd write the bridge ourselves
- Bad, free tier exists but the chart project pattern is already on Infisical; switching costs > benefit

### C. HashiCorp Vault

- Good, full-featured; industry standard for secret management
- Bad, self-hosted ops burden dwarfs the project; managed Vault is paid-only
- Bad, overkill at this scale; reaches for a forklift to move a houseplant

### D. 1Password

- Good, already in personal use; strong UX
- Bad, CI integration via `op run --` works but is a second secrets surface alongside dev secrets
- Bad, no varlock plugin; bridge would be hand-rolled
- Bad, rotation choreography across CF Workers gets the same problem as Infisical without the plugin path benefit. Skipped.

### E. GitHub Actions secrets + local `.env`

- Good, zero new dependencies
- Bad, no single source of truth — dev `.env`, GH secrets, and Worker secrets drift independently
- Bad, no audit log, no rotation surface, no per-path scoping
- Bad, the problem this ADR exists to solve

## Implementation Notes

- This ADR ratifies the choice. The wiring lands in follow-up tickets, not in this PR.
- Adoption plan: [`docs/infra/secrets-adoption-plan.md`](../infra/secrets-adoption-plan.md) — per-env matrix, init flow, workflows, open questions.
- Cross-references:
  - ADR 0001 — varlock + `.env.schema` is the validation layer; this ADR adds the source layer beneath it.
  - `oh-monorepo-6is` — parent ticket (closed by this PR).
  - `oh-monorepo-no7` — CF Pages deploy workflow that performs the wrangler-from-CI secret push step.
- Follow-up tickets (each blocked-by `oh-monorepo-6is`):
  - `oh-monorepo-bgd` — Run `varlock init` + annotate `.env.schema` with `@sensitive`.
  - `oh-monorepo-35p` — Install varlock-infisical plugin and verify `varlock load` locally.
  - `oh-monorepo-lwb` — Wire Wrangler secret push step into CF Pages deploy workflow (cross-link `oh-monorepo-no7`).
  - `oh-monorepo-frr` — Nightly drift-detection workflow: `varlock load` on main, fail on missing.
