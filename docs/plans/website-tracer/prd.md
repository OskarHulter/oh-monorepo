# website-tracer — PRD

> Synthesized from `research.md` + `r1-spike-notes.md` + bd `oh-monorepo-6mn` (RFC) without re-interview.
>
> **Amendment 2026-04-26:** Tanstack Start adoption deferred per ADR `docs/adr/0007-defer-tanstack-start.md`. v1 ships on plain Vite + React static. R1 spike remains valid as future-migration evidence; not the v1 path.

## Problem statement

The current site at [oskarhulter.com](https://oskarhulter.com/) is a stale 2023 blog scaffold with one post, hosted on Cloudflare, with no source in this monorepo. We want a fresh landing page that is mine, ships from this repo, and proves the rails for the broader portfolio: Tanstack Start (static) on top of `vp`, components and feature hooks living in `@oh/client/ui`, secrets via Infisical+varlock, hosted on Cloudflare Pages, with a clean preview-subdomain → apex DNS cutover. The site itself is small; the value is in the seams it lays down for everything that comes after (charts, scanners, dashboards, finance/timeseries).

## Solution

A single landing page at `/` shipped from `apps/website`, built with **plain Vite + React 19 + Tailwind v4 on `vp`**. Static output (`dist/`) drops into Cloudflare Pages. The page shows: name, short bio, a small set of social links. The site replaces the current oskarhulter.com via a preview-subdomain → DNS swap.

Optional build-time prerender via `vite-react-ssg` (or a small custom render script) if SEO HTML proves needed for the landing route — otherwise SPA-shell + hydrate is acceptable at this size.

The library `@oh/client` is reshaped to the ports & adapters design from `oh-monorepo-6mn`: kernel exports `Providers`, UI surface lives at `@oh/client/ui`, only the fixture adapter ships from the library, and concrete adapters (router, telemetry, theme, data) live in the consumer at `apps/website/src/adapters/`. App shell `<App>` is consumer-owned. Cosmos fixtures land alongside every component.

The framework choice is **decoupled from the RFC**: `@oh/client` is React + ports + adapters and works identically under plain Vite, Tanstack Start, or any other React host. Migration to Tanstack Start later is gated on a feature that earns it (per ADR 0007).

When this ships:

- Visitors hit a fast, fully prerendered landing page that respects their colour-scheme preference.
- Search engines index correct title/description/OG metadata.
- A single `vp build` in `apps/website` produces the static output that CF Pages serves.
- The library shape is real enough that adding a second feature (say a chart panel) is a matter of adding a feature folder + a port + an adapter, not a refactor.
- Every decision deferred from this PRD (auth, telemetry, charts, blog) plugs into a port that already exists.

## User stories

### Visitor (happy path)

1. As a visitor, I want to see a hero with the site owner's name and tagline immediately on first paint, so that I know I'm in the right place.
2. As a visitor, I want a short bio so that I can decide in a few seconds whether to keep reading.
3. As a visitor, I want a small set of social/contact links so that I can reach out via my preferred channel.
4. As a visitor, I want the page to load fast on slow networks so that the experience is not gated by JS.
5. As a visitor, I want the page to respect my system colour-scheme preference so that I don't get flashbanged.
6. As a visitor, I want clickable social links to open in a new tab without losing my browsing context.
7. As a visitor browsing on mobile, I want the layout to be readable without horizontal scroll.
8. As a visitor with reduced-motion preferences, I want the site to honour that and avoid unnecessary animation.
9. As a visitor with screen reader, I want landmark roles, semantic headings, and accessible link labels.

### Visitor (edge cases / errors)

10. As a visitor on a 404 (any unknown path), I want a sensible page that points back to home, not a generic Cloudflare error.
11. As a visitor whose browser blocks third-party domains, I want the page to still render fully because the landing has no third-party dependencies.
12. As a visitor whose network drops mid-page, I want the prerendered HTML to remain readable even if hydration fails.

### Search / crawler

13. As a search crawler, I want valid `<title>`, `<meta name="description">`, `lang`, and OpenGraph/Twitter tags so that listings render correctly.
14. As a crawler, I want a working `robots.txt` and a `sitemap.xml` (single entry) so that the page is indexable.
15. As a social-share preview generator, I want an OG image (or a deterministic generated one) so that the link looks legitimate when shared.

### Developer (consuming `@oh/client`)

16. As a developer building a new page, I want to import `Providers`, `Hero`, `SocialLinks` from `@oh/client` / `@oh/client/ui` and wire ports in `apps/website/src/adapters/`, so that the library doesn't dictate the route or app shape.
17. As a developer, I want `@oh/client/ui/styles.css` to be the single CSS source of truth so that I never wonder where styles come from.
18. As a developer, I want `vp lint --type-aware` to fail on any concrete infra import inside `src/ui/**` or `src/ui/features/**` so that ports discipline is enforced, not aspirational.
19. As a developer, I want React Cosmos to open every component in isolation with a fixture adapter, so that I can iterate UI without booting the whole app.
20. As a developer, I want `vp build` to produce a deployable static artefact for CF Pages without extra steps.
21. As a developer, I want `vp dev` to hot-reload edits to `@oh/client/ui` and feature hooks without a published rebuild loop.

### Operator (deploy / cutover)

22. As an operator, I want `apps/website` to deploy to a preview hostname (`preview.oskarhulter.com`) automatically on every push to the spike/feature branch, so that I can validate before swapping apex.
23. As an operator, I want a runbook describing TTL lowering, preview validation, apex DNS swap, and rollback.
24. As an operator, I want the new site to coexist with current Cloudflare zone services (email, security rules) without breakage.
25. As an operator rolling back, I want a single documented step (remove custom domain on the new Pages project + restore prior apex record) that returns traffic to the previous origin.
26. As an operator, I want secrets sourced from Infisical and synced to CF Pages env vars at deploy time, never committed in plain text.
27. As an operator, I want a CI step that fails the deploy if `varlock load` finds a missing or malformed required value.

### Admin / governance

28. As a maintainer, I want the burn-down of the existing `apps/website` to keep the bits worth keeping (`public/` icons + favicon, varlock env schema, `@oh/shared/websiteSchema` consumption pattern) and discard the vanilla-Vite demo content.
29. As a maintainer, I want the throwaway `apps/website-spike/` (PR #11) deleted before this implementation lands on `main` so that we don't ship two website packages.
30. As a maintainer, I want `routeTree.gen.ts` ignored from version control in the real app so that diffs stay clean.

## Implementation decisions

### Modules to build / modify

**`@oh/client` — kernel (`packages/client/src/`)**

- `index.ts` — exports `Providers`, `usePorts`, port type re-exports.
- `ports.ts` — cross-cutting port type definitions (`TelemetryPort`, `RouterPort`, `ThemePort`, `DataPort`, `Ports`).
- `providers.tsx` — single `<Providers ports>` umbrella that puts ports onto a context. No QueryClient, no Suspense, no toast — those are consumer-owned for v1.
- Replaces the current single-stub `index.ts`.

**`@oh/client/ui` (`packages/client/src/ui/`)**

- `index.ts` — high barrel re-exporting from `./components` and `./features`. The only public UI entry.
- `styles.css` — Tailwind v4 entry (`@import "tailwindcss"`) and any `@theme` token block used by components.
- `components/{hero,social-links,layout}/*` — presentational React components with co-located `*.fixture.tsx`.
- `features/social-links/*` — feature folder containing `use-social-links.ts`, `port.ts` (`SocialLinksPort` type), `fixture.ts` (port impl returning seed data).
- `cosmos.config.ts` co-located convention; root config at package root.

**`@oh/client/adapters/fixture` (`packages/client/src/adapters/fixture/`)**

- `index.ts` — `createFixturePorts(seed?)` factory. Composes per-feature fixture impls (initially just social-links) into a `Ports` object with passthrough router/theme/telemetry implementations suitable for tests and Cosmos.

**`apps/website` (rebuilt — plain Vite + React)**

- Burn current `src/` (counter, vanilla template) but preserve: `public/{favicon.svg,icons.svg}`, `.env.schema`, `site.config.ts` shape (env → `@oh/shared/websiteSchema` → typed object), `tests/` (port to new structure).
- `index.html` — single Vite entry; head metadata templated from `siteConfig` via `vite-plugin-html` or inline `%VITE_*%` placeholders.
- New `src/main.tsx` — Vite/React entry; mounts the consumer-owned `<App>` into `#app`.
- New `src/app.tsx` — consumer-owned `<App>` that mounts `<Providers ports>` around the page content. No router needed for v1 (single route).
- New `src/adapters/index.ts` — composes ports for the app: fixture for `data` and `telemetry`, simple location-based or no-op adapter for `router` (no Tanstack Router in v1; `RouterPort.Link` becomes a thin `<a>` wrapper, `useParams` returns empty), CSS-media-query adapter for `theme`. Concrete adapters live in subfiles (`router.ts`, `theme.ts`, `telemetry.ts`).
- `vite.config.ts` — plugin order: `varlockVitePlugin`, `tailwindcss`, `viteReact`. No Tanstack Start, no Nitro.
- Optional: `vite-react-ssg` if static prerender HTML is wanted for SEO. Decision deferred to implementation; default is SPA-shell + hydrate.

**Workspace catalog (`pnpm-workspace.yaml`)**

- Add `react`, `react-dom`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `@types/react`, `@types/react-dom` as catalog entries so `apps/website` and `packages/client` share versions.
- Do NOT add `@tanstack/react-router`, `@tanstack/react-start`, or `nitro` in v1 (they land when ADR 0007's revisit trigger fires).

**CI / deploy (`.github/workflows/`)**

- Add a Pages deploy workflow: build `apps/website` via `vp run website#build`, deploy `.output/public` to a CF Pages project via Wrangler (or CF Pages git integration if simpler at this stage).
- Inject env at build time via Infisical CLI (`infisical run -- vp run website#build`) using a CI service token.
- Existing CI workflow stays; new workflow only runs on the relevant feature/main branches.

### Interface shapes

- **`Providers`** takes a single `ports: Ports` prop and `children`. No defaults are wired; passing fixture ports is the test/cosmos default.
- **`usePorts()`** returns the `Ports` value from context. Throws if used outside `<Providers>`.
- **`Hero`** is a presentational component with no props in v1 (reads name/tagline from `usePorts().data.site` if introduced later, or from props directly — see "open questions").
- **`SocialLinks`** consumes `useSocialLinks()` (no props) and renders an accessible list of links.
- **`useSocialLinks()`** calls `usePorts().data.socialLinks.list()` synchronously in v1 because the fixture adapter is synchronous; the port signature is async-ready (`Promise<SocialLink[]>`) so future R2/Convex adapters compose.
- **`SocialLinksPort`** lives at `@oh/client/ui/features/social-links/port.ts`; the cross-cutting `DataPort` umbrella imports the type so adding a feature is one folder + one line.

### Architectural decisions (referencing prior artefacts)

- Ports & adapters per RFC `oh-monorepo-6mn` is the spine. No deviation in this PRD.
- TS-source exports (no `vp pack` build step in dev) for v1; revisit when `@oh/client` is published externally.
- React Cosmos uses fixture ports as a decorator so every fixture renders without a real adapter wired.
- `oxlint` `no-restricted-imports` rule prohibits concrete infra (`@sentry/*`, `@duckdb/*`, `@cloudflare/*`, raw URLs) from `src/ui/**` and `src/ui/features/**`. Only `src/adapters/fixture/**` and `apps/website/src/adapters/**` may import them.
- **Framework: plain Vite + React 19** for v1 (per ADR 0007). Tanstack Start adoption deferred to first dynamic feature.
- **Prerender stance:** SPA-shell + hydrate is acceptable on a 30–45 kB gzip landing. Opt into `vite-react-ssg` only if SEO testing shows missing index content hurts.
- DNS cutover: lower TTL 24 h before; preview deploy to `preview.oskarhulter.com`; smoke (Lighthouse, link-check, real-device); swap apex via CF Pages "Custom domain" (apex CNAME flatten managed by CF); monitor 24 h; rollback by removing custom domain + restoring prior apex record.

### Schema changes

- `apps/website/.env.schema` keeps existing `SITE_*` keys; add only what the landing actually reads (likely no new keys for v1).
- `@oh/shared` may grow a `socialLinkSchema` (zod) used by the `SocialLink` type both in fixtures and in any future real adapter.

### Key interactions

- App boot: `src/main.tsx` mounts `<App>` into `#app`. `<App>` builds `ports` from `./adapters/index.ts` and renders `<Providers ports>` around `<Hero />` + `<SocialLinks />`. Head metadata is templated into `index.html` at build time via varlock.
- Feature: `<SocialLinks />` calls `useSocialLinks()` → `usePorts().data.socialLinks.list()` → fixture returns seed data → component renders list.
- Build: `vp build` runs Vite production build → emits `dist/` containing hashed JS/CSS, prerendered `index.html`, and `public/` assets.
- Deploy: CI runs `vp build` with Infisical-injected env → uploads `dist/` to CF Pages → preview URL or production custom domain based on branch.

## Testing decisions

### What "good test" means here

External behaviour at module seams. Boundary tests on `@oh/client` public exports (no internal-component tests). Playwright E2E against the prerendered HTML (not against `vp dev`) so we test the artefact users actually see. Cosmos fixtures double as visual regression source.

### Modules that get test coverage

- **`@oh/client/ui` components** — Cosmos fixture per component (minimum one; multiples for state coverage). Vitest browser tests on rendered output for accessibility-floor checks (semantic headings, link `aria-label`, contrast token via Tailwind class assertions).
- **`@oh/client/ui/features` hooks** — Vitest unit tests with `createFixturePorts(seed)` injecting deterministic data; assert hook return shape and that it calls the port (not a fetch URL or anything concrete).
- **`@oh/client/adapters/fixture`** — One smoke test asserting `createFixturePorts()` returns a valid `Ports` object (typecheck-level + runtime sanity).
- **`apps/website`** — Playwright E2E against `dist/` served by `vp preview` (or equivalent static server): root route returns 200 with the expected title/meta/H1; social links are present and have correct `href` and `target="_blank" rel="noopener noreferrer"`; OG image link is present in head; CF Pages `_redirects` (if used for SPA fallback) routes unknown paths back to the landing.
- **Build artefact** — Single smoke assertion in CI that `dist/index.html` contains `siteConfig.name` literal, ensuring varlock env actually flowed through the build.

### What is intentionally NOT tested at this stage

- Real CF Pages deployment from CI (smoke on the deploy URL is enough; we don't mock Wrangler).
- Real DNS swap (manual procedure with runbook).
- Hydration parity beyond "page renders" (no React user-interaction beyond link clicks in v1).

### Prior art

- `apps/website/tests/site.config.test.ts` — existing Playwright + DOM-injection assertion. Adapt to assert on prerendered HTML rather than runtime DOM.
- `vite-plus/test` — Vitest wrapper used elsewhere; same import pattern (`import { expect, test } from 'vite-plus/test'`).
- `@oh/shared` schema-driven validation pattern — reuse for the new `socialLinkSchema` if introduced.

## Out of scope

The following are explicitly NOT in this PRD; each has its own bd ticket or roadmap home:

- **Blog, posts, tags, RSS, search.** Single 2023 post; not value-driving. Defer until content strategy demands it.
- **Real auth.** Site is fully public. Auth lands when content goes behind login (oh-monorepo-te9 — Better-Auth eval).
- **Real telemetry adapter (Sentry).** v1 ships a fixture telemetry port. Adapter lands per oh-monorepo-jn4.
- **Charts, indicators, scanners.** Landing has no charts. Lands per oh-monorepo-b4c when finance UI begins.
- **Shaders / animation.** Intentional minimal aesthetic for v1. Lands per oh-monorepo-cgt.
- **Bot lane / interstitial experiment.** Layered later per oh-monorepo-y9a.
- **Public APIs / Unkey.** No public API surface in v1. Per oh-monorepo-6iu.
- **DuckDB-WASM / R2 data port.** No dynamic data on the landing. Per oh-monorepo-b4b.
- **Convex vs Drizzle+DO.** Same — no reactive metadata on the landing. Per oh-monorepo-ctc.
- **`vp pack` multi-entry external publish of `@oh/client`.** v1 uses TS-source exports; revisit on first external consumer.
- **Theme toggle UI.** v1 follows OS `prefers-color-scheme` only. Manual toggle deferred.
- **i18n / locale switching.** `SITE_LOCALE=en-US` is fixed in v1.
- **Tanstack Start adoption.** Deferred per ADR 0007. v1 is plain Vite + React. R1 spike (PR #11) preserved as migration evidence; lands as proven path when first dynamic feature earns it.
- **File-based routing.** Single route in v1 — hand-written. Adopt Tanstack Router or similar when route count + shared layouts justify it.
- **Server functions / loaders.** None in v1. Lands with Tanstack Start migration.

## Further notes

### Open questions to resolve in implementation

1. **Static prerender:** ship SPA-shell + hydrate (default, simplest, ~30–45 kB gzip JS) or add `vite-react-ssg` for prerendered HTML at build time. Decide based on first Lighthouse + crawler check on the SPA-shell version.
2. **`Hero` data source:** props vs port-driven (read site name/tagline from a `SitePort`). Lean: props for v1 (single-page, no reuse), port if a second page lands.
3. **OG image:** static asset in `public/` (simplest) vs runtime-generated via Workers (premature). Lean: static SVG/PNG in `public/og.png`.
4. **404 / SPA fallback:** simplest CF Pages `_redirects` rule mapping `/* /index.html 200` to support deep-link refreshes; add a small "page not found" inline component if the URL doesn't match the single landing path.
5. **Email obfuscation:** current site uses CF email obfuscation. Verify whether contact email is exposed at all in v1 (simplest: don't include an email link, only social profiles); if email is needed, link via `mailto:` and let CF zone-level email obfuscation continue.
6. **CF Pages deploy mode:** Wrangler-from-CI vs CF Pages git integration. Lean: Wrangler-from-CI for parity with future Workers projects and for Infisical injection at deploy time.
7. **React 19 transition mode:** strict-mode dev-only. Acceptable to keep `<React.StrictMode>` wrapping `<App>`.

### Risks (carrying forward from research, post-amendment)

| #   | Risk                                                  | Status / Mitigation                                                                                                                                    |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | vp + Tanstack Start compat                            | RESOLVED (PR #11 GREEN). Not blocking v1 because TS Start is deferred. Knowledge retained for future migration.                                        |
| R2  | varlock env not injected into Vite build              | Already proven in current `apps/website` (`varlockVitePlugin()` + `import.meta.env`). No new risk.                                                     |
| R3  | Tailwind v4 + Vite plugin compat                      | Tailwind v4 + `@tailwindcss/vite` is stable on Vite 8 (vite-plus 0.1.19). Verify in implementation by asserting a utility class hits the rendered DOM. |
| R4  | Static prerender / hydration mismatch                 | DROPPED. Plain Vite SPA-shell has no SSR, hence no mismatch surface.                                                                                   |
| R5  | `@oh/client` multi-entry build                        | Sidestepped by TS-source exports for v1.                                                                                                               |
| R6  | CF Pages routing on static SPA                        | Single route + `_redirects` fallback.                                                                                                                  |
| R7  | Apex DNS swap interaction with existing zone services | Snapshot zone settings before swap; rollback path documented; smoke includes "email path still works" check.                                           |

### Cycle position

> Cycle steps follow [`docs/feature-dev-process/README.md`](../../feature-dev-process/README.md) (letters, not numbers — sequence is a guide, optional steps allowed).

- **A. Idea** — done in conversation.
- **B. [Research](../../feature-dev-process/01-research.md)** — `research.md`, `r1-spike-notes.md`, RFC `oh-monorepo-6mn`. Done. PR #11.
- **C. Prototype** — R1 spike at `apps/website-spike/` (Tanstack Start path verified GREEN; not the v1 path per ADR 0007, retained as future-migration evidence). Done. PR #11.
- **D. PRD — this document, amended 2026-04-26 to defer Tanstack Start.**
- **D.5 ADR** — `docs/adr/0007-defer-tanstack-start.md` records the framework decision + revisit trigger.
- **E. Kanban** — done. Slices filed as `oh-monorepo-{ss1, 7a6, 1ob, 559, 4ge, 2v7, no7, f0l, uqy}` with dependency graph wired.
- **F. [Implementation](../../feature-dev-process/02-implementation.md)** — TDD per slice. Burn-down deletes both the existing `apps/website/src/` demo content AND `apps/website-spike/`.
- **G. Code Review** — `brooks-lint:brooks-review` on each PR.
- **H. [Human QA](../../feature-dev-process/03-human-qa.md)** — `qa` skill on the deployed preview.
- **I. QA Followups** — triage as bd issues.
- **J. [Team Review](../../feature-dev-process/04-team-review.md)** — solo project; this step is a tag-yourself.
