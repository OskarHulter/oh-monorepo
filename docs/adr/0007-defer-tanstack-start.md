# 0007. Defer Tanstack Start adoption to first dynamic route

- Status: Adopted
- Date: 2026-04-26
- Deciders: @oskarhulter

## Context and Problem Statement

The website-tracer feature targets a landing-only MVP at `apps/website` to replace [oskarhulter.com](https://oskarhulter.com/). The R1 spike (PR #11) verified that **Tanstack Start RC + Nitro + Tailwind v4 + React 19 builds and serves end-to-end on top of `vp`**. So the technical path is open.

But the v1 page is one route, no loaders, no server functions, no client-side routing, no auth, no dynamic data. Tanstack Start ships ~100 kB gzip JS in that configuration before any product code lands — a baseline cost paid for capabilities the page does not use.

## Decision Drivers

- Tracer principle: nail the MVP first, extend with complexity.
- Bundle weight on a static landing matters for first-paint and Lighthouse posture.
- Tanstack Start is RC; pinning to RC adds breaking-change risk to a page whose reason for existing is cutover stability.
- Future dynamic features (charts, scanners, dashboards, blog) will earn the framework's weight; today's page does not.
- Migration cost from "plain Vite + React" to "Tanstack Start" is small (~2–3 hours), already proven viable in the R1 spike.

## Considered Options

- Tanstack Start RC, Nitro `static` preset
- Plain Vite + React, no SSR
- Plain Vite + React with build-time prerender (`vite-react-ssg` or a small render script)
- Astro
- Vanilla TS (no React) — current `apps/website`

## Decision Outcome

Chosen option: **Plain Vite + React (static, no SSR by default)** for v1. Optional static prerender via `vite-react-ssg` if SEO HTML proves needed for the landing route.

Tanstack Start adoption is **deferred until the first dynamic route or feature earns it** — most likely the first chart or scanner page, or when a server function is needed.

### Positive Consequences

- Bundle drops from ~100 kB gzip to ~30–45 kB gzip on the landing.
- Removes RC-status dependency from v1.
- Cuts catalog additions: no `@tanstack/react-start`, `@tanstack/react-router`, `nitro` for v1.
- Same final artefact shape — `dist/` static — drops into Cloudflare Pages identically.
- `@oh/client` Ports & Adapters refactor (RFC `oh-monorepo-6mn`) ships unchanged; React + ports + adapters do not depend on Tanstack Start.
- All other tracer goals (RFC implementation, Tailwind v4, Cosmos workflow, Infisical+varlock pipeline, CF Pages preview-subdomain → DNS swap) ship with no scope change.

### Negative Consequences

- Future migration to Tanstack Start is real work (~2–3 h plus per-route loader rewrites).
- File-based routing convenience is deferred.
- Re-doing head-metadata wiring at migration time (different mechanism in TS Start vs plain Vite).
- The R1 spike code at `apps/website-spike/` (PR #11) is preserved as evidence but does not become production code. It will be deleted during v1's burn-down.

## Pros and Cons of the Options

### Tanstack Start RC, Nitro static preset

- Good, because consistent with future dynamic phases; file-based routing; first-class SSR.
- Bad, because ~100 kB gzip JS overhead for a single static route; RC dependency.

### Plain Vite + React (chosen)

- Good, because lighter, stable, equal CF Pages fit, all RFC goals preserved.
- Bad, because future migration to TS Start is non-zero work.

### Plain Vite + React + `vite-react-ssg`

- Good, because adds prerender for SEO HTML at minimal weight.
- Bad, because plugin maturity varies; adds a dep for unclear marginal benefit at one route.
- Treated as an opt-in inside the chosen option, not a separate path.

### Astro

- Good, because designed for content-shaped static sites with React island support.
- Bad, because adds a third tooling lane; doesn't compose with `@oh/client`'s React-first design as cleanly; pulls focus from the actual portfolio rails.

### Vanilla TS (no React)

- Good, because smallest possible bundle.
- Bad, because incompatible with the `@oh/client` RFC (which is React); reverts the library refactor or splits the codebase.

## Revisit trigger

Adopt Tanstack Start when **any of**:

1. The first route requiring a loader / server function / dynamic data lands.
2. The first feature requiring file-based routing complexity (>3 routes with shared layouts and nested params).
3. Tanstack Start reaches 1.0 stable AND a feature on the roadmap actively benefits from it.

Migration plan at that time:
- Catalog `@tanstack/react-start`, `@tanstack/react-router`, `nitro` per the R1-verified versions (or current at the time).
- Add the Vite plugin chain from R1: `tailwindcss`, `tanstackStart`, `viteReact`, `nitro`.
- Move `apps/website/src/routes/` to Tanstack file-routing convention.
- Re-route head metadata from `index.html` template → `__root.tsx` head config.
- Document the migration in a follow-up ADR.

## Cross-references

- PR #11 — research + R1 spike (Tanstack Start verified on `vp`).
- `docs/plans/website-tracer/research.md` — research artifact.
- `docs/plans/website-tracer/r1-spike-notes.md` — spike outcome and reusable plugin order for future migration.
- bd `oh-monorepo-bmp` — PRD tracking ticket (amended to reflect this decision).
- bd `oh-monorepo-6mn` — `@oh/client` RFC (unchanged; framework-agnostic).
