# Secrets adoption plan — Infisical via varlock

> **Designated:** This is the **secrets-source area**. Infisical is the single source of truth for secret values; varlock (ADR 0001) is the validator. Other secret stores (1Password, GH-secrets-only, etc.) are deliberately not in play — they were ruled out in ADR 0012.
>
> Tracked by `oh-monorepo-6is`. Update in place as adoption stages move; this file is a living plan, not an immutable decision. Ratifying decision lives in [ADR 0012](../adr/0012-infisical-secrets-source.md).

## Why this exists

ADR 0001 picked the validation layer (varlock + `.env.schema`). ADR 0012 picked the source layer (Infisical). This doc connects them — what loads what, in which environment, and how to keep the three views in sync.

## Per-environment matrix

| Environment                       | Source of secret values                                         | Loader / consumer                                                                    | Validation                              |
| --------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------- |
| Local dev                         | Infisical (dev path) via service token in shell                 | `varlock load` resolves `@sensitive` items via the Infisical plugin                  | varlock validates `.env.schema` at load |
| CI (GitHub Actions)               | Infisical (CI path) via `INFISICAL_TOKEN` GH Action secret      | `varlock load` in the workflow before build/deploy                                   | varlock validates `.env.schema` in CI   |
| Prod (Cloudflare Pages / Workers) | Infisical (prod path) → wrangler secret bindings at deploy time | Workers read env bindings at runtime; `wrangler secret put` populates them at deploy | varlock validates at Worker cold start  |

Notes:

- Service tokens are scoped per environment path. CI never sees the dev path; dev never sees the prod path.
- Workers cannot reach Infisical at runtime, so prod uses a deploy-time push (`infisical run -- wrangler secret put …` or equivalent step in the deploy workflow). See `oh-monorepo-lwb`.
- Non-sensitive items keep loading from `.env` files unchanged. Only items annotated `@sensitive` round-trip through Infisical.

## Init flow

Five-step bootstrap. Each step has a follow-up ticket; track progress on those, not this doc.

1. **`varlock init`** — generate `.env.schema` from current `.env`. (`oh-monorepo-bgd`)
2. **Annotate `@sensitive`** — mark every secret item in `.env.schema` with the `@sensitive` decorator. Non-sensitive items stay un-annotated and continue loading from `.env`. (`oh-monorepo-bgd`)
3. **Install varlock-infisical plugin** — wire varlock to resolve `@sensitive` items from Infisical. Shell-out fallback to `infisical secrets get` for any constraint the plugin can't carry. (`oh-monorepo-35p`)
4. **`varlock load` — verify locally and in CI** — run with the dev service token locally, confirm `ENV.*` resolves; do the same in a CI workflow before extending it. (`oh-monorepo-35p` for local; CI portion lands with the deploy workflow, `oh-monorepo-no7`/`oh-monorepo-lwb`)
5. **Wire Wrangler secret push step in deploy workflow** — `infisical run -- wrangler secret put …` (or equivalent) inside the CF Pages deploy job. Workers read the resulting bindings at runtime. (`oh-monorepo-lwb`, cross-link `oh-monorepo-no7`)

## Workflows

### Rotation

1. Rotate the value in Infisical (UI or CLI).
2. CI redeploy is triggered (manually or on next push).
3. Deploy workflow runs `wrangler secret put` with the new value, pushing it to Workers bindings.
4. Worker cold-start runs `varlock load` against the new bindings — fails fast if the value is malformed.

No hand-syncing GH secrets. No `wrangler secret put` from a laptop. One source, one rotation action, one validation surface.

### New environment

1. Copy the source Infisical project (or create a sibling environment within the project — see open questions).
2. Generate a new service token scoped to the new environment's path.
3. Add the token to the appropriate GH Action secret (CI) or shell env (local).
4. Deploy — varlock load reads from the new path; no schema changes needed.

### Drift detection

Nightly GH Actions cron workflow runs `varlock load` against `main` with the CI service token. Fails the build if any `@sensitive` item declared in `.env.schema` is missing from Infisical (or vice-versa, depending on plugin behavior). Catches drift between schema and Infisical project state before it bites a deploy. (`oh-monorepo-frr`)

## Open questions (resolve at adoption time, not now)

- **Project layout in Infisical** — one project per app (apps/website, future apps each get their own) vs one project per repo (oh-monorepo as a single Infisical project, paths split by app). Decide at adoption time — depends on how many apps land in the next quarter and whether tokens need cross-app scope.
- **Path scoping for client-readable vs server-only vars** — public site vars (e.g. `SITE_URL`) and server-only secrets (e.g. API tokens) should sit on different paths so build-time exposure is auditable. Decide the path naming convention when annotating `@sensitive` items in step 2.
- **Audit log retention** — Infisical free tier audit retention is limited; if compliance signal is needed beyond the default window, decide whether to upgrade or pipe audit events to a separate sink. Decide when (if) compliance pressure arrives.

## Cross-references

- [ADR 0001 — Validate env schema](../adr/0001-validate-env-schema.md) — varlock + `.env.schema` is the validator; this plan adds the source layer beneath it.
- [ADR 0012 — Infisical as the secrets source-of-truth](../adr/0012-infisical-secrets-source.md) — the ratifying decision.
- `oh-monorepo-6is` — parent ticket; closed when this plan + ADR 0012 land.
- `oh-monorepo-no7` — CF Pages deploy workflow (HITL setup); the wrangler secret push step lands inside its workflow file.
- `oh-monorepo-bgd` — `varlock init` + `@sensitive` annotation (follow-up).
- `oh-monorepo-35p` — varlock-infisical plugin install + local verify (follow-up).
- `oh-monorepo-lwb` — Wrangler secret push step in CF Pages deploy workflow (follow-up; cross-link `oh-monorepo-no7`).
- `oh-monorepo-frr` — Nightly drift-detection workflow (follow-up).
- [Cloudflare inventory](./cloudflare-inventory.md) — Workers/Pages are the prod consumers; deploy-time push step lives in their deploy workflow.

## How to update this doc

- A follow-up ticket completes → check off in cross-refs and note the date in changelog.
- An open question gets resolved → move it from the open-questions section to a brief note in the relevant workflow section.
- A new environment is added (e.g. staging) → extend the per-environment matrix; note in changelog.

## Changelog

- 2026-04-27 — Doc seeded alongside ADR 0012 (`oh-monorepo-6is`). Five-step init flow drafted; four follow-up tickets filed (`oh-monorepo-bgd`, `oh-monorepo-35p`, `oh-monorepo-lwb`, `oh-monorepo-frr`). No wiring landed yet — implementation begins on follow-up tickets.
