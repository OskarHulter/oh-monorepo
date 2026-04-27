# Sentry adoption plan

> Living reference. [ADR 0014](../adr/0014-adopt-sentry.md) ratifies Sentry as the front-end error / RUM / release-health backbone; this doc carries the **wiring + workflow patterns + experiment-lane schema** as they are decided.
>
> Tracked by `oh-monorepo-jn4`. Update in place as projects come online, sampling rates change, or the interstitial experiment evolves; this file is a living plan, not an immutable decision.

## Project layout

One Sentry project per app or worker. Alerts route by ownership (CodeOwners), not through a global firehose. New apps file a follow-up ticket to add a project; nothing is shared by default.

| App / surface           | Sentry project slug (proposed) | Runtime           | SDK packages (planned) | Notes                                                |
| ----------------------- | ------------------------------ | ----------------- | ---------------------- | ---------------------------------------------------- |
| `apps/website`          | `oh-website`                   | Browser           | `@sentry/browser`      | Replay + BrowserTracing + Profiling integrations on  |
| Gateway worker (future) | `oh-gateway`                   | Cloudflare Worker | `@sentry/cloudflare`   | Lands with `oh-monorepo-6iu`                         |
| Per-worker (each)       | `oh-worker-<name>`             | Cloudflare Worker | `@sentry/cloudflare`   | One project per worker; do not share                 |
| Cron / batch (each)     | `oh-cron-<name>`               | Cloudflare Worker | `@sentry/cloudflare`   | Cron-monitor instrumented per workflow step          |
| Interstitial experiment | (rides on `oh-website`)        | Browser           | `@sentry/browser`      | Variant-tagged events, not a separate Sentry project |

Status: zero projects provisioned yet. Adoption happens via the spike follow-up.

## SDK init blueprint (narrative — no installs in this PR)

Browser (`apps/website`):

- Init in a single adapter file (`apps/website/src/adapters/sentry.ts`); app code never imports `@sentry/*` directly. The adapter satisfies `TelemetryPort` from RFC `oh-monorepo-6mn`.
- Integrations enabled at init: `BrowserTracing` (route + fetch spans), `Replay` (errors-only at 100%, baseline 10%), `Profiling` (sampled per `tracesSampleRate`).
- DSN + tunnel path read from varlock-validated env per [ADR 0001](../adr/0001-validate-env-schema.md). No DSN literals in source.
- Release tag = git SHA injected at build (`SENTRY_RELEASE`); environment tag = deploy target (`production` / `preview` / `local`).
- `beforeSend` runs the PII scrubbing ruleset (see Open questions); refuses unknown finance-shaped keys.
- `tracesSampleRate` starts at 0.1; raise per route as needed via `tracesSampler`.

Cloudflare Workers:

- Init via `@sentry/cloudflare` in each worker's entry. Same DSN-via-env discipline.
- Cron monitors instrumented at the workflow-step boundary, not at the worker level.
- Same `beforeSend` shape; finance-shaped keys are stripped before send.

`TelemetryPort` binding (the only surface app code uses):

- `captureError(err, ctx?)` → `Sentry.captureException`
- `captureEvent(name, ctx?)` → `Sentry.captureMessage` / `addBreadcrumb` (per event class)
- `startSpan(name, attrs?)` → `Sentry.startSpan`
- `setUser(user?)` → `Sentry.setUser`
- `setTag(key, value)` → `Sentry.setTag`

The adapter is the only place this binding lives. Swapping vendors is one file.

## Source-map upload flow (CI)

- Step runs after the production build, before the deploy step.
- Tool: `@sentry/cli` invoked via `getsentry/action-release` (or pinned equivalent). The action must be **SHA-pinned with a `# vX.Y.Z` comment** per [ADR 0006](../adr/0006-ci-risk-mitigation.md); verify the tag → SHA via `gh api repos/getsentry/action-release/tags --jq ...` before pinning.
- Inputs: `SENTRY_AUTH_TOKEN` (CI secret), `SENTRY_ORG`, `SENTRY_PROJECT`, release = git SHA.
- **Fail-deploy on missing maps.** If the upload step fails or no `.map` files are found, the deploy job exits non-zero. Release-health crash-free % is meaningless against minified frames; this gate is non-negotiable.
- Source maps are uploaded but **not deployed** (CSP keeps them off the public origin). Sentry resolves frames server-side from the uploaded artifacts.
- Workflow permissions stay at `contents: read` per ADR 0006; the Sentry token is the only elevated credential and lives in `secrets`.

## Worker-route tunnel (`/_sentry`)

Adblockers drop direct `*.sentry.io` requests. We tunnel via a CF Worker route:

- Route: `oh-monorepo.example/_sentry` (final path TBD per env). The browser SDK's `tunnel` option points here.
- Worker: parses the envelope's DSN host header, validates it against an allowlist, forwards to the matching Sentry ingest URL, returns the response verbatim.
- **CSP.** `connect-src` includes `'self'` (covers the tunnel) and explicitly does **not** include `*.sentry.io` once the tunnel is live — the goal is to keep ingest first-party.
- **Rate-limit.** Per-IP token bucket on the Worker (e.g. KV-backed) — abuse via the open tunnel is the obvious attack. Limits sized so legitimate Replay flushes don't trip the bucket.
- **Bot-score gate.** Drop requests with CF bot score below a threshold before forwarding (see `oh-monorepo-y9a`). Cheap defense against script-driven envelope flooding.
- Error surface: tunnel errors are themselves captured (different Sentry project, separate DSN) — no infinite loop.
- Open question: tunnel as Worker route vs. app-level redirect — see Open questions.

## Release tagging

- Every browser + worker SDK init reads `SENTRY_RELEASE` (= git SHA, injected at build).
- Deploy webhook (CF Pages / Workers deploy → custom Worker → Sentry release API) creates the release object, attaches commits, and marks the deploy.
- Cross-references for trace ↔ release ↔ commit: Sentry release → git SHA → GitHub commit → PR.
- Crash-free sessions / users are computed per release; the diff between consecutive releases is the primary regression signal (see Workflow 3 below).

## Saved workflow patterns (six)

These are the practised patterns Sentry buys us. Each is a saved view / monitor / dashboard, configured once at adoption time.

1. **Triage Discover query.** Saved query: top unresolved issues by impact (event count × users affected) over the last 7 days, scoped per project. Owner: weekly triage.
2. **Replay-driven RCA.** On each top issue, jump from the issue page → linked replays → reproduce. Replay sampling is set so errors always have a session attached (see Sampling).
3. **Release Health diff.** Saved comparison view: crash-free sessions/users for the current release vs. the previous one. Used as the primary "is this release worse?" signal post-deploy.
4. **Sentry Cron monitors.** Each batch worker + each Workflow step has a Cron monitor. Missed beats fire an alert; consecutive failures escalate.
5. **Custom dashboards.** Three saved dashboards: front-end errors (per project), backend perf (p95 latency per worker / per route), batch reliability (success rate + duration per cron). Dashboards are the standing read path; Discover is for ad-hoc.
6. **Spike alerts (stddev).** Issue alert: event rate > N stddev above 1h rolling baseline → notify. Catches anomalies the static thresholds miss.

## Sampling

| Surface           | Traces | Replay (baseline) | Replay (on error) | Profiling              |
| ----------------- | ------ | ----------------- | ----------------- | ---------------------- |
| `apps/website`    | 0.1    | 0.1               | 1.0               | per `tracesSampleRate` |
| Workers (gateway) | 0.1    | n/a               | n/a               | per `tracesSampleRate` |
| Workers (cron)    | 1.0    | n/a               | n/a               | per `tracesSampleRate` |
| Interstitial path | 0.5    | 1.0 (path-scoped) | 1.0               | per `tracesSampleRate` |

`tracesSampler` in the adapter promotes the interstitial path (`/challenge/*`) to the higher rates above; everything else stays at the baseline.

## Interstitial / bot-control experiment lane

This is a tagged variant comparison riding on `oh-website`, not a separate project. Feeds from `oh-monorepo-y9a` (bot / anti-bot research lane) and rides the OpenFeature flag from `oh-monorepo-8it`.

### Variant-tag schema

Set on every Sentry event from the website while the experiment is active:

| Tag                      | Values                                | Source                                |
| ------------------------ | ------------------------------------- | ------------------------------------- |
| `interstitial.variant`   | `control` \| `interstitial`           | OpenFeature flag (`oh-monorepo-8it`)  |
| `interstitial.outcome`   | `passed` \| `challenged` \| `bounced` | Adapter computes from challenge state |
| `cf.ray`                 | CF Ray ID                             | `cf-ray` request header               |
| `cf.bot_score`           | 0–99                                  | CF Bot Management header              |
| `interstitial.detour_ms` | integer                               | Custom transaction span duration      |

Tags are set via `TelemetryPort.setTag` on session start and refreshed per challenge event.

### Replay sampling (experiment-scoped)

- Baseline: 10% (matches the website default).
- On error: 100% (matches the website default).
- **Path-scoped boost:** 100% for any session where `pathname` matches `/challenge/*`, regardless of error. Costs more replay storage; that's the whole point of the experiment.

### Issue alert thresholds

- Errors on `/challenge/*` `> N / 5m` AND `interstitial.variant == interstitial` → alert.
- Initial `N` set at adoption time from a 24h baseline run with the flag off; tune after week one.
- Alert routes to the experiment owner, not to the global on-call channel.

### Transaction-span instrumentation

- Custom span `interstitial.detour` wraps the period between challenge entry and resolution (passed / challenged / bounced).
- Tracked metric: p95 of `interstitial.detour_ms` per variant. Compared in a saved dashboard.
- Span attributes carry the same variant tags so the dashboard can slice cleanly.

### Web Vitals comparison

- LCP and INP captured via BrowserTracing.
- Saved view: median + p95 LCP / INP per `interstitial.variant`. Used to quantify UX disruption cost of the interstitial.
- Comparison runs over a fixed window (e.g. 7 days) once the flag is at 50/50.

### Goal

Quantify the cost of the interstitial in:

- Error-rate delta (per-variant unresolved issue count / event rate)
- UX delta (LCP / INP medians + p95)
- Funnel delta (`interstitial.outcome == bounced` rate)

The output is a single readout per experiment cycle, written back to `oh-monorepo-y9a` as a comment with links to the saved dashboard and Replay set.

## Open questions (resolve at adoption time, not now)

| Question                                                                                | Why deferred                                                                                | Decide when                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Sentry plan tier — free dev / Team / Business?                                          | Free covers tracer phase; quota only bites once event volume is real                        | When monthly events exceed 80% of the free quota for two consecutive weeks      |
| PII scrubbing ruleset for finance data leaking into stack traces / breadcrumbs / replay | Default `beforeSend` is not enough; ruleset depends on which finance shapes actually appear | Before any finance-shaped data flows (gates the scanner / portfolios workloads) |
| Interstitial experiment — Worker route vs app-level redirect for the challenge detour   | CSP + bot-score-gate vs SPA-level routing tradeoff; pick once the challenge UX is drafted   | When the bot lane on `oh-monorepo-y9a` ships its first interstitial             |

## Cross-references

- [ADR 0001](../adr/0001-validate-env-schema.md) — DSN + tunnel path live in varlock-validated env.
- [ADR 0006](../adr/0006-ci-risk-mitigation.md) — CI source-map upload action inherits SHA-pin + version-comment.
- [ADR 0014](../adr/0014-adopt-sentry.md) — frames this doc.
- RFC `oh-monorepo-6mn` — `TelemetryPort` shape (the adapter's binding surface).
- `oh-monorepo-y9a` — bot / anti-bot research lane (interstitial experiment's data source).
- `oh-monorepo-vf4` — PostHog (separate product analytics surface; not a Sentry replacement).
- `oh-monorepo-8it` — OpenFeature + GrowthBook (the variant flag this experiment reads).
- `oh-monorepo-2th` — SigNoz (backend / infra traces; system-of-record boundary).
- `docs/infra/cloudflare-inventory.md` — Worker-route tunnel + bot-score header come from CF.

## How to update this doc

- A Sentry project ships → set its row's status to "live" and note the date in the changelog.
- Sampling rates change → update the table; do not delete the old rate, note the change in the changelog.
- A new saved workflow pattern is added → append to the six; do not split the file.
- An open question resolves → move it to a new "Decided" section with the date and the resolution; keep the question text for traceability.
- The interstitial experiment ends → snapshot the readout under "Past experiments" and remove the live-tag schema if it's no longer set.

## Changelog

- 2026-04-27 — Doc seeded from `oh-monorepo-jn4` notes alongside ADR 0014. No projects provisioned, no SDK installed, no tunnel deployed; all rows pending follow-up tickets.
