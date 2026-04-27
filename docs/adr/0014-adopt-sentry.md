# 0014. Adopt Sentry as the error / RUM / release-health backbone; reserve a tagged interstitial-experiment lane

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

The website + workers will start producing real errors, perf regressions, and Web Vitals as soon as the tracer slices land. We need an error-monitoring + RUM tier that maps cleanly onto the `TelemetryPort` shape from RFC `oh-monorepo-6mn`, survives Cloudflare-fronted adblockers, and gives us a tagged lane to compare a control vs. an interstitial / bot-control variant when `oh-monorepo-y9a` lights up. SigNoz (`oh-monorepo-2th`) is already the backend / infra-trace target; this decision is specifically the front-end-focused error + replay + release-health tier, not a competing trace store.

## Decision Drivers

- **Port-shaped fit.** RFC `oh-monorepo-6mn` defines `TelemetryPort` (capture-error / capture-event / start-span / set-user / set-tag); a Sentry adapter is a 1:1 bind — no impedance with the kernel.
- **Adblock survival on a CF-fronted site.** A first-party Worker route tunnel is the only reliable ingest path; Sentry's documented tunnel pattern fits CF Workers cleanly.
- **RUM coverage in one product.** Replay + BrowserTracing + Profiling cover the front-end RUM tier without standing up a second vendor for session replay.
- **Release-health out of the box.** Crash-free sessions / users + per-release diff arrives from the SDK + a CI source-map upload step — no bespoke pipeline.
- **CodeOwners-friendly layout.** One Sentry project per app/worker means alerts route by ownership, not by a global firehose.
- **Reversibility.** All capture goes through `TelemetryPort` — swapping out Sentry behind it is a single adapter change, not a callsite migration.
- **Cost shape.** Free dev tier covers the tracer phase; the upgrade decision is gated on real event volume, not speculative.

## Considered Options

- **A. Sentry SaaS** — adopt as the front-end error / RUM / release-health backbone; SigNoz keeps backend / infra traces; experiment lane via Sentry tags.
- **B. Self-host Sentry (or GlitchTip)** — own the data; eat the ops cost.
- **C. Push everything to SigNoz** — single backend; build replay + release-health in OTel.
- **D. Defer** — error monitoring lands when an outage forces it.

## Decision Outcome

Chosen option: **A — Sentry SaaS**, because it maps 1:1 onto `TelemetryPort`, ships Replay + Profiling + Release Health without bespoke wiring, tunnels cleanly through a CF Worker route, and leaves SigNoz as the system of record for backend / infra traces. The interstitial-experiment lane is reserved as a tag-driven variant comparison rather than a separate product. Adoption details (project layout, source-map upload, tunnel route, release tagging, six saved-workflow patterns, experiment-lane schema) live in [`docs/infra/sentry-adoption-plan.md`](../infra/sentry-adoption-plan.md) as a living plan — this ADR ratifies the principle, not the wiring.

### Positive Consequences

- `TelemetryPort` gets a real adapter; the kernel's port discipline (`oh-monorepo-6mn`) is exercised end-to-end.
- One Sentry project per app/worker → alerts respect CodeOwners; no global noise.
- Worker-route tunnel (`/_sentry`) keeps adblocked users visible without breaking CSP — captured front-end errors actually arrive.
- Source-map upload in CI fails the deploy if maps are missing — release-health crash-free % is real, not inferred from minified frames.
- Interstitial / bot-control experiment rides on tags + replay sampling; no second product, no double-bookkeeping.
- SigNoz boundary stays clean: front-end errors + RUM + release-health here; backend / infra traces there.

### Negative Consequences

- Vendor lock until the adapter is exercised against another telemetry backend; mitigated by `TelemetryPort` discipline but real.
- Replay + Profiling integrations add browser-side weight — sampling has to stay disciplined or the marketing page pays for it.
- PII scrubbing rules need explicit thought before any finance data flows; a default `beforeSend` is not enough.
- Adblock tunnel is a CF Worker route we own — CSP, rate-limit, and abuse-handling become our problem, not Sentry's.
- Free tier event quota will bite once event rate is real; plan-tier decision is deferred but inevitable.

## Pros and Cons of the Options

### A. Sentry SaaS

- Good, native Replay + BrowserTracing + Profiling integrations; one product covers front-end RUM
- Good, Release Health with source-maps gives crash-free % per release without bespoke math
- Good, Worker-route tunnel pattern is documented; adblock survival without dropping events
- Good, free dev tier is enough to ship the tracer phase
- Bad, vendor; full migration cost lives behind `TelemetryPort` discipline staying clean
- Bad, plan-tier upgrade is inevitable once event volume is real

### B. Self-host Sentry / GlitchTip

- Good, own the data; PII story is fully under our control
- Good, no per-event quota
- Bad, ops surface (Postgres, ClickHouse, Redis, symbolicator) for a portfolio repo with no on-call rotation
- Bad, GlitchTip is leaner but lags on Replay + Profiling — the integrations we actually want

### C. Push everything to SigNoz

- Good, single backend for traces + errors + RUM; one query surface
- Good, OTel-native end to end
- Bad, replay isn't a SigNoz primitive; we'd build it or skip it
- Bad, release-health (crash-free %, per-release diff) is a Sentry-shaped product feature — recreating it is months of work for a portfolio repo

### D. Defer

- Good, zero work now
- Bad, the first outage that hits the website happens without source-maps, replay, or alerts — we learn nothing actionable
- Bad, the interstitial-experiment lane on `oh-monorepo-y9a` has no comparison surface when it lights up

## Implementation Notes

- This ADR ratifies the **principle**. The wiring (project-per-app layout, SDK-init blueprint, source-map upload, Worker-route tunnel, release tagging, saved workflows, interstitial-experiment lane) lives in [`docs/infra/sentry-adoption-plan.md`](../infra/sentry-adoption-plan.md) as a living document.
- No `@sentry/*` packages are installed by this PR. Adoption happens in follow-up tickets, each gated on its own review.
- Source-map upload step in CI must use a SHA-pinned `getsentry/action-release` (or equivalent) per [ADR 0006](0006-ci-risk-mitigation.md); fabricated SHAs caused two CI failures already, so verify the tag → SHA before pinning.
- `TelemetryPort` (RFC `oh-monorepo-6mn`) is the single capture surface from app code. `apps/website/src/adapters/sentry.ts` (or equivalent) is the only callsite that touches `@sentry/*` directly — library packages never import the SDK.
- Open questions (plan tier, PII scrubbing rules, Worker-route vs app-level redirect for the experiment) are tracked in the living plan and resolved at adoption time, not now.
- Tracked by `oh-monorepo-jn4`.

## Cross-references

- RFC `oh-monorepo-6mn` — `TelemetryPort` shape that the Sentry adapter binds to.
- [ADR 0001](0001-validate-env-schema.md) — DSN + tunnel path travel through varlock-validated env, not free-floating literals.
- [ADR 0006](0006-ci-risk-mitigation.md) — CI source-map upload step inherits SHA-pin + version-comment discipline.
- `oh-monorepo-y9a` — bot / anti-bot research lane; the interstitial experiment consumes this telemetry surface.
- `oh-monorepo-vf4` — PostHog adoption; experiment lane shares an OpenFeature flag provider.
- `oh-monorepo-8it` — OpenFeature + GrowthBook wiring; the variant flag the experiment reads from.
- `oh-monorepo-2th` — SigNoz adoption; backend / infra traces live there, not in Sentry.
