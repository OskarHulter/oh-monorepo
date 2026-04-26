# website-tracer — Research

> **Post-research note (2026-04-26):** v1 of the website-tracer ships on plain Vite + React per [ADR 0007](../../adr/0007-defer-tanstack-start.md). The R1 spike below verifies that Tanstack Start RC works on `vp` — that finding is preserved as future-migration evidence, not the v1 path. Read alongside [`prd.md`](./prd.md) for the current implementation contract.

## Question

Can we replace [oskarhulter.com](https://oskarhulter.com/) with a landing-only MVP at `apps/website` using **Tanstack Start (static)**, with components in `@oh/client/ui` and hooks in `@oh/client/features` (subpath exports), styled with **Tailwind v4**, hosted on **Cloudflare Pages**, on top of the existing **vite-plus** toolchain — and prove the rails (config, env, DNS cutover) end-to-end?

## Findings

### Repository state (as of 2026-04-26, branch `fix/release-action-sha`)

- **Toolchain:** `vite-plus@0.1.19` and `@voidzero-dev/vite-plus-core@0.1.19` (bundles Vite **8.0.8**, Rolldown 1.0.0-rc.16, tsdown 0.21.9). `pnpm-workspace.yaml:18-19`, root `package.json:35`.
- **Workspace shape:** `apps/website` (vanilla TS+Vite demo), `packages/{client,shared,server,utils}`, `tools/*`. No React, no Tanstack, no Tailwind, no Cloudflare/wrangler in any `package.json`.
- **`apps/website` current contents:** `src/main.ts` (DOM template literals + counter), `src/site.config.ts` (varlock-driven `websiteSchema.parse` from `@oh/shared`), `src/style.css` (CSS variables, `@media (prefers-color-scheme)` dark mode), `index.html`, `public/{favicon.svg,icons.svg}`, `tests/site.config.test.ts` (Playwright browser test asserting metadata DOM injection), `.env.schema` (`SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION`, `SITE_LOCALE`, `SITE_THEME_COLOR`).
- **`@oh/client` shape:** single-entry export `".": "./dist/index.mjs"` (`packages/client/package.json:17-19`), `vp pack` build with `dts.tsgo: true, exports: true`, src is a stub. Tests via `vite-plus/test`.
- **`@oh/shared` reuse:** exports `websiteSchema` + `Website` type via TS source (`"." → "./src/index.ts"`), already consumed by `apps/website/src/site.config.ts`.
- **Env stack:** root `.env.schema` (APP*ENV, LOG_LEVEL) + `apps/website/.env.schema` (SITE*\*). Wired via `varlockVitePlugin()` in `apps/website/vite.config.ts:1`. Typegen via `vp run website#env:typegen` in root `package.json:24`. CI loads env via `dmno-dev/varlock-action` (`.github/workflows/ci.yml:27-29`).
- **CI:** `voidzero-dev/setup-vp@v1.8.0` is the established setup action; runs `vp check`, `vp run -r test`, `vp run -r build` on PRs and main. No CF Pages workflow yet. Release pipeline via `changesets/action`.
- **Engines:** Node ≥24, `pnpm@10.33.2`. Restricted-access Changesets, `updateInternalDependencies: patch`, private packages versioned for monorepo tracking.
- **Ticketing/persistence:** `bd` (beads) is canonical; `MEMORY.md` lives at `~/.claude/projects/-Users-osh-Code-personal-oh-monorepo/memory/`.

### Tanstack Start (RC) snapshot

Source: `examples/react/start-basic` from TanStack/router `main` (verified via raw GitHub fetch).

- **Status:** Release Candidate, "feature-complete preparing for 1.0".
- **Runtime deps:** `@tanstack/react-start@^1.167.49`, `@tanstack/react-router@^1.168.24`, `react@^19`, `react-dom@^19`.
- **Dev deps:** `vite@^8.0.0`, `@vitejs/plugin-react@^6.0.1`, `@tailwindcss/vite@^4.2.2`, `tailwindcss@^4.2.2`, `nitro@^3.0.260311-beta`, `typescript@~6.0.2`.
- **Vite plugin:** `import { tanstackStart } from '@tanstack/react-start/plugin/vite'`; `tanstackStart({ srcDirectory: 'src' })`.
- **Server runtime:** `nitro` (separate plugin: `import { nitro } from 'nitro/vite'`) — present even for static builds, though static prerender can sidestep its runtime needs.
- **Static support:** Tanstack Start docs reference both **Static Prerendering** and **Incremental Static Regeneration (ISR)** as first-class topics. Deployment narrative: "anywhere JS can run".
- **Cloudflare specifics:** no explicit CF Pages adapter name found in the docs we could fetch (RC docs partially returned 500/403 across the session). Static prerender output should drop into CF Pages as a static site without an adapter. CF Workers deployment is a separate path.

### Tailwind v4 fit

- `@tailwindcss/vite@^4` is the modern integration: zero PostCSS, fast, requires Vite ≥6. Vite-plus bundles Vite 8 → green.
- One global `@import "tailwindcss"` stylesheet replaces the v3 `@tailwind` directives. Co-locates well with `@oh/client/ui` if we expose a `styles.css` entry from the package.

### vite-plus ↔ Tanstack Start compatibility

- **Vite major version:** vite-plus 0.1.19 bundles Vite 8.0.8; Tanstack Start RC peer is `vite ^8`. **Major-version compat is green.**
- **Plugin chain:** vite-plus's `defineConfig()` accepts standard Vite `plugins`. Tanstack Start, `nitro`, `@vitejs/plugin-react`, and `@tailwindcss/vite` are all standard Vite plugins — they should compose, but this is unverified at runtime in this repo.
- **`vp dev` vs `vp build`:** unproven on a Tanstack Start app. Unknowns: SSR module resolution under vite-plus's Rolldown bundler, prerender hook compatibility with vp's Vite Task wrapper, dev-server middleware composition.
- **Library-mode vs app-mode:** `apps/website` would run `vp dev`/`vp build`, not `vp pack`. `vp pack` is reserved for the `@oh/client` library build.

### Patterns to preserve (from the burn-down)

1. **Varlock env contract** in `.env.schema` + `@oh/shared/websiteSchema` parse → keep, port site metadata into the new app shell.
2. **Public assets** (`favicon.svg`, `icons.svg`) — keep, Tanstack Start serves `public/` by default.
3. **CSS-only dark mode** — current `@media (prefers-color-scheme: dark)` works fine with Tailwind v4 (`dark:` variant or media-query strategy).
4. **Playwright E2E shape** — port `site.config.test.ts` against the rendered Tanstack Start static output (or shift to a build-time assertion on the prerendered HTML).
5. **`voidzero-dev/setup-vp` + `dmno-dev/varlock-action`** — keep for CI; add a Pages deploy step alongside.

### Friction points (FRICTION callouts from exploration)

- **`@oh/client` subpath exports:** `vp pack`'s `exports: true` auto-infers from `package.json`. Multi-entry (`./ui`, `./features`) likely needs an explicit entry array in `vite.config.ts`. Unverified.
- **Tanstack Start + Varlock env:** no precedent; `import.meta.env` is client-side, but Tanstack Start has an SSR/prerender boundary. `varlockVitePlugin()` must run in both client and server pipelines under `tanstackStart()` — risk that env injection diverges.
- **Static output vs Nitro plugin:** `nitro/vite` is in the example even for SSR; for static-only we may be able to drop it after prerender, or just leave it inert. To verify in the prototype.
- **CF Pages adapter status for Tanstack Start RC:** docs ambiguity — the safe path is `prerender all → static output → drop into CF Pages` rather than relying on a Workers adapter that may still be in flux.
- **Untested current `apps/website` runtime code** (only `site.config.test.ts` runs) — burn-down has no QA loss.

## Constraints

- **Toolchain non-negotiable:** must continue to use `vp` per `AGENTS.md`. **Escape hatch (acknowledged with the user):** if `vp dev`/`vp build` cannot host Tanstack Start without intolerable workarounds, **MVP v1 may fall back to plain Vite for `apps/website` only**, with the compat finding logged as an ADR and a follow-up bd ticket to revisit when vite-plus catches up. The library build (`@oh/client` via `vp pack`) stays on vp regardless.
- **Hosting: Cloudflare Pages**, static output, preview-subdomain → swap cutover. No Workers in v1.
- **Env: Infisical via varlock** is the secrets baseline (see `oh-monorepo-6is`); `.env.schema` is the contract; production values land in CF Pages env vars / Wrangler secrets at deploy time.
- **Subpath exports: subpaths of `@oh/client`**, not separate workspace packages.
- **Visual scope: minimal monochrome typography + bio + social links** (parity with the current site's vibe; no blog, no posts, no RSS in v1). Redesign is explicitly out of scope.
- **Node ≥24, pnpm 10.33.2** — confirmed compatible with Tanstack Start (no minimum-Node concern at this version).

## Prior art

- **Tanstack Start `examples/react/start-basic`** — canonical scaffold; mirror its plugin order (`tailwindcss`, `tanstackStart`, `viteReact`, `nitro`).
- **`apps/website/src/site.config.ts`** — existing pattern for `websiteSchema.parse(ENV.*)`; reuse verbatim.
- **`@oh/shared`** — already a TS-source package (`"." → "./src/index.ts"`); good template for how `@oh/client` could expose source paths during dev if multi-entry build proves fiddly.
- **WorkOS `authkit-tanstack-start`** (Context7-documented integration) — reference for Tanstack Start middleware/server-fn patterns when auth lands later.
- **`docs/adr/0002-unified-dev-tooling-vite-plus.md`** — captures the vp escape-hatch posture; this tracer is the first real test of that posture.

## Risks (with verification plan)

| #   | Risk                                                                       | Verify how                                                                                                               | Severity              |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| R1  | `vp dev`/`vp build` does not cooperate with `tanstackStart()` plugin chain | Spike a minimal Tanstack Start app inside `apps/website-spike/` (throwaway), run `vp dev` and `vp build`, observe        | High                  |
| R2  | Varlock env not injected into Tanstack Start client + server pipelines     | After R1 spike, read `ENV.SITE_NAME` from a route component and a server function; confirm both                          | Med                   |
| R3  | Tailwind v4 + vite-plus + Tanstack Start plugin order conflict             | Add `@tailwindcss/vite` per example; verify utility class shows up in built HTML                                         | Med                   |
| R4  | Static prerender misses some routes / hydration mismatch                   | Run prerender on the landing route only (single-page MVP); diff served HTML vs hydrated DOM                              | Low (MVP has 1 route) |
| R5  | `@oh/client` `vp pack` cannot produce multi-entry subpath bundles          | Update `packages/client/vite.config.ts` to declare entries; run `vp pack`; inspect `dist/` for `ui.mjs` + `features.mjs` | Med                   |
| R6  | CF Pages misroutes SPA fallback / asset paths                              | Deploy preview to `preview.oskarhulter.com`; verify direct route hits + assets + 404                                     | Low (single page)     |
| R7  | Apex DNS swap breaks email obfuscation or other CF zone services           | Inventory current zone settings before swap; document rollback (point apex back to prior origin)                         | Med                   |

## Open questions

1. **Plain-Vite fallback boundary:** if R1 forces a fallback, do we keep `vp lint`/`vp fmt`/`vp check`/`vp test` (likely yes) and only swap `vp dev`/`vp build` for native `vite`? Locking that boundary up front shrinks the blast radius.
2. **Where do Tanstack Start route files live?** `src/routes/__root.tsx` + `src/routes/index.tsx` is the convention — confirm under `apps/website/src/routes/`. Index route imports from `@oh/client/ui`/`features`.
3. **Tailwind tokens — co-located with `@oh/client/ui` or in `apps/website`?** Picks downstream styling reuse. Lean toward `@oh/client/ui` exporting `styles.css` so future apps share tokens.
4. **`@oh/client` build strategy:** dual-entry tsdown via `vp pack`, OR shift `@oh/client` to TS-source exports like `@oh/shared` (no build, faster dev). Library publish goal might force a build, but for _internal_ consumption source-export is simpler.
5. **CF Pages project**: GitHub Pages-integration (auto-build on push) vs Wrangler-CLI deploy from CI. Prefer the latter for env parity with future Workers projects.
6. **Test surface:** do we keep Playwright as the test runner (slow, browser-real) or shift basic metadata assertions to a fast prerendered-HTML check + Playwright only for hydration/UX?

## Deepening opportunities

The meaningful design decision the tracer surfaces is **`@oh/client`'s shape**. Ousterhout-test: today the package is shallow (one stub fn, one entry) — the interface barely hides anything. Once `ui/` and `features/` land, the package risks staying shallow if every component and hook is its own export.

Three candidate cuts (no proposals yet — just clusters):

### Candidate 1 — `@oh/client/ui` as a thin design-system module

- Cluster: components + tokens + (eventually) primitives like `Button`, `Stack`, `Heading`.
- Why coupled: shared Tailwind tokens, shared accessibility/keyboard patterns, shared theming.
- Dependency category: framework-bound (React + Tailwind v4) — the _tokens_ are non-framework data, the _components_ are framework adapters around them.
- Test impact: today none. Post-deepening, boundary tests are rendered-output snapshots + Cosmos fixtures (per `oh-monorepo-su7`). Component-internal logic disappears from the public API.

### Candidate 2 — `@oh/client/features` as feature hooks owning data + UX behavior

- Cluster: hooks that bind a feature's data source (Tanstack Query / fetcher / DuckDB-WASM later) to UI behavior; ex. `useSocialLinks()`, future `useChartTimeframe()`, `usePortfolio()`.
- Why coupled: a feature's data fetching, caching, and derived state are inseparable in the consumer's mind. Splitting hook + fetcher + types just leaks abstraction.
- Dependency category: cross-boundary — needs ports for the data source so the same hook can run against R2 parquet, an API, or a fixture.
- Test impact: replaces "test the fetcher unit + test the hook unit" (today: zero such tests) with "test the hook with a fake port" (one boundary).

### Candidate 3 — `@oh/client` itself as a single deep package with deliberately few exports

- Cluster: the whole package. `./ui` and `./features` are subpaths but each subpath aims for **a small public surface** (a handful of named exports — not "every internal component").
- Why coupled: subpath multiplication is the failure mode that turns a deep package into a shallow one. Discipline matters more than tooling.
- Dependency category: structural — about export hygiene and barrel-file rules, not runtime deps.
- Test impact: enforces "test the public symbol" — internals can change freely.

### Chosen direction (drilled via `improve-codebase-architecture`)

Candidate 3 selected. Four parallel designs explored (minimal / per-symbol leaves / common-caller default / ports & adapters). Final pick: **hybrid — Ports & Adapters spine + small ergonomic core**, with `<App>` consumer-owned and `@oh/client` exporting `<Providers>`. Public surface: 4 entries (`.`, `./ui`, `./ui/styles.css`, `./adapters/fixture`). UI surface (`./ui`) holds components + feature hooks via a high barrel. Cross-cutting ports at core; feature-specific data ports co-located with features. Fixture adapter is the only adapter shipped; concrete adapters (R2, Sentry, Better-Auth, Tanstack Router) live in `apps/website/src/adapters/`.

Refactor RFC: **`oh-monorepo-6mn`** — full structure, exports map, ports schema, oxlint discipline rules, build strategy (TS-source for v1), migration steps.

## Recommendation

**Viable — R1 PROVEN GREEN (2026-04-26).** See [`r1-spike-notes.md`](./r1-spike-notes.md).

Spike at `apps/website-spike/` (throwaway) compiled and served Tanstack Start RC + Nitro + Tailwind v4 + React 19 on top of `vp install` / `vp build` / `vp dev` with no patching. `vp build` produced three Vite environments (client/SSR/nitro) in ~450 ms; `vp dev` returned SSR HTML at HTTP 200 with Tailwind classes intact. **No fallback to plain Vite needed for v1.**

Outstanding configuration question moved to implementation: Nitro preset choice for CF Pages target (static vs cloudflare-pages). Default is `node-server`; we want `static` for the landing-only MVP.

Sequence:

1. **Throwaway spike** (`apps/website-spike/`, deleted before merge): scaffold Tanstack Start basic example, swap official Vite CLI for `vp dev`/`vp build`. Resolve R1 in one sitting. Outcome dictates whether the real `apps/website` rebuild stays on vp or falls back to plain Vite for v1.
2. **Decide and ADR**: capture R1 outcome + framework-fallback boundary. _Landed as [`docs/adr/0007-defer-tanstack-start.md`](../../adr/0007-defer-tanstack-start.md)._
3. **Pick one deepening candidate** (1, 2, or 3 above) before writing the PRD — it shapes how `packages/client` is reorganized.
4. **Then**: PRD (step D in the cycle) using accepted research + ADR.

If R1 fails outright (vp + Tanstack Start truly incompatible at this RC), the plain-Vite-only fallback for `apps/website` is acceptable for v1 and gets logged as a risk under `docs/adr/0002` with a bd ticket to revisit when vite-plus or Tanstack Start tightens compat.

## Cross-references (context, not scope)

These tickets are _adjacent_ roadmap surface — explicitly out of this tracer's scope, but the tracer's choices should not foreclose them:

- P2 cluster: `oh-monorepo-te9` (auth), `oh-monorepo-jn4` (Sentry), `oh-monorepo-vf4` (PostHog), `oh-monorepo-6is` (Infisical via varlock), `oh-monorepo-4dn` (Drizzle), `oh-monorepo-b4c` (charts), `oh-monorepo-cgt` (animation/shaders), `oh-monorepo-su7` (react-cosmos), `oh-monorepo-tfx` (CF-only area), `oh-monorepo-yts` (web perf), `oh-monorepo-lgb` (security scanning).
- P3 cluster: `oh-monorepo-2th` (SigNoz), `oh-monorepo-8it` (OpenFeature+GrowthBook), `oh-monorepo-b4b` (DuckDB local-first), `oh-monorepo-ctc` (Convex vs Drizzle+DO), `oh-monorepo-6iu` (Unkey), `oh-monorepo-fhi` (IaC), `oh-monorepo-qpi` (SkillForge + perf), `oh-monorepo-y9a` (bot lane incl. Turnstile + Turnkey), `oh-monorepo-4e2` (misc repo eval), `oh-monorepo-e00` (openapi-changes).
