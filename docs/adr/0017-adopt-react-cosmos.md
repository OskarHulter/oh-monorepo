# 0017. Adopt react-cosmos as the component sandbox for `@oh/client/ui`; per-package config + ports decorator

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

`@oh/client/ui` is the surface every consumer renders against. Slice 559 (PR #20) landed `Hero` + `SocialLinks` with co-located `*.fixture.tsx` files written for the cosmos shape, but no sandbox is wired yet — fixtures sit there as dead code. Without a component browser, every iteration on a UI primitive forces booting `apps/website`, fixture seeds, and the full router; the kernel discipline (RFC `oh-monorepo-6mn`) erodes the moment a contributor takes a shortcut and reaches into a real adapter to "see" a component. We need a dev-only sandbox that (1) loads every fixture in isolation, (2) wraps every fixture with `<Providers ports={createFixturePorts()}>` so the kernel discipline is the path of least resistance, (3) loads the same Tailwind v4 token sheet `@oh/client/ui/styles.css` so visuals match production, and (4) doesn't fight `vite-plus`'s wrapped Vite chain. RFC `oh-monorepo-6mn` already specified `cosmos.config.ts` at `packages/client` root; this ADR ratifies the principle and resolves four open questions left by ticket `oh-monorepo-su7`.

## Decision Drivers

- **Port-shaped fit.** Every fixture should render under `<Providers ports={createFixturePorts()}>` so the kernel's port discipline (RFC `oh-monorepo-6mn`) is enforced by the sandbox itself, not by reviewer vigilance.
- **Fixture-as-prop-snapshot ergonomics.** Co-located `Component.tsx` + `Component.fixture.tsx` is already in tree (slice 559). The sandbox must consume that shape — not require a parallel `*.stories.tsx` migration.
- **Tailwind v4 fidelity.** The decorator must import `@oh/client/ui/styles.css` (the single Tailwind source per slice 1ob) so sandbox renders match production tokens.
- **vite-plus passthrough.** The monorepo's `vite` resolves to `@voidzero-dev/vite-plus-core` (per `pnpm-workspace.yaml` override + `peerDependencyRules.allowAny: [vite]`). Whatever sandbox we pick has to accept that drop-in without forking its own Vite.
- **Discovery roots are relative.** Cosmos's discovery walks from `rootDir` outward; a per-package config keeps that walk local to `packages/client/src/ui`, so any future package can adopt a sibling cosmos config without cross-talk.
- **Dev-only blast radius.** Sandbox is `devDependencies` of `packages/client` only. It must not creep into `apps/website` runtime or root.
- **Reversibility.** Fixtures are plain `*.fixture.tsx` files exporting a default JSX or component — switching the harness later is a config change, not a fixture migration.

## Considered Options

- **A. react-cosmos** — file-suffix `*.fixture.tsx`, default-export JSX or component, first-party Vite renderer (`react-cosmos-plugin-vite`), decorator-based providers.
- **B. Storybook (Vite builder)** — `*.stories.tsx`, larger CSF format, addon ecosystem (a11y, controls, docs).
- **C. Ladle** — Storybook-compatible CSF subset, single Vite-native binary, lighter than Storybook.
- **D. Defer** — keep components live-tested via `apps/website`; no isolation harness until a complex hook forces it.

## Decision Outcome

Chosen option: **A — react-cosmos at `packages/client/cosmos.config.json` with a `cosmos.decorator.tsx` that wraps every fixture with `<Providers ports={createFixturePorts()}>` and imports `@oh/client/ui/styles.css`**. Existing slice-559 fixtures already match cosmos's default-export shape; no migration. The four open questions left in ticket `oh-monorepo-su7` resolve as: per-package config (discovery is relative; future packages get sibling configs), all-fixtures decorator (kernel discipline by default), Tailwind v4 via decorator import (single source), hooks harness deferred (cosmos is component-focused — first complex hook will file a follow-up). Adoption mechanics, decorator design, and operating notes live in [`docs/infra/cosmos-adoption.md`](../infra/cosmos-adoption.md) as a living doc — this ADR ratifies the principle, not the wiring.

### Positive Consequences

- Fixtures already in tree (slice 559) become live the moment cosmos starts; no rewrite.
- Decorator forces every fixture through `<Providers ports={createFixturePorts()}>` — slice-4ge lint discipline is reinforced by sandbox-time wiring, not just lint output.
- `@oh/client/ui/styles.css` import in the decorator keeps Tailwind v4 tokens in lockstep with production (slice 1ob).
- Cosmos starts its own Vite dev server (`react-cosmos-plugin-vite`) on port 5050 with an optional `vite.config.ts` reuse — `apps/website` dev workflow is untouched.
- Reversible: fixtures are plain `*.fixture.tsx` modules; swapping to Ladle or Storybook later is a config + decorator port, not a fixture migration.
- Visual-regression follow-up (`oh-monorepo-2v7`) gets a static `cosmos-export` target instead of needing a screenshot-test rig from scratch.

### Negative Consequences

- Cosmos-vite renderer pins Vite via peer deps; `vite-plus` overrides resolve `vite` to `@voidzero-dev/vite-plus-core`. Works on paper via `peerDependencyRules.allowAny: [vite]`, but a vite-plus-core API drift could break cosmos's plugin without warning. Mitigation: cosmos lives in `packages/client` devDeps only, so a break is isolated to `vp run client#cosmos`, not production.
- Cosmos config schema only ships JSON Schema validation; the file is `cosmos.config.json` not `cosmos.config.ts` (the plan-of-record callout in RFC 6mn used "`cosmos.config.ts`" loosely; cosmos itself reads JSON). Documented in `docs/infra/cosmos-adoption.md`.
- Cosmos has no first-class hooks-harness story — only components. Hooks in `features/**` need a different sandbox (or Vitest browser mode) when they grow complex enough to need one. Deferred.
- Adds three transitive packages (`react-cosmos`, `react-cosmos-plugin-vite`, `react-cosmos-dom`) — all dev-only, but the install footprint grows.
- Lint enforcement of the "every component has ≥1 sibling fixture" convention is deferred to a follow-up; until then, the convention is reviewer-enforced.

## Pros and Cons of the Options

### A. react-cosmos

- Good, because fixture shape (`default export JSX or component`) matches what slice 559 already shipped — zero migration cost.
- Good, because cosmos's vite renderer (`react-cosmos-plugin-vite`) is first-party and accepts an existing `vite.config.ts` via `vite.configPath`.
- Good, because the decorator pattern (`cosmos.decorator.tsx` files auto-discovered up the tree from each fixture) maps cleanly onto "wrap everything in `<Providers>`".
- Good, because `cosmos-export` produces a static bundle — drop-in target for the future Playwright visual regression follow-up.
- Bad, because the package ecosystem is smaller than Storybook's; addon coverage (a11y panel, controls UI, docs) is thinner.
- Bad, because docs site has gaps on monorepo configuration; we will live-document the seam in `docs/infra/cosmos-adoption.md` instead.

### B. Storybook (Vite builder)

- Good, because the addon ecosystem (Controls, A11y, Docs, Interactions) is mature and battle-tested.
- Good, because CSF stories are an industry-standard format; portability if we change tools again is high.
- Bad, because slice-559 fixtures would need to migrate from default-export JSX to CSF named exports — every existing fixture rewrites for no kernel-discipline gain.
- Bad, because Storybook 8+ on Vite still ships a Webpack-shaped runtime story for some addons; the surface area to debug when it fights `vite-plus` is much larger.
- Bad, because the decorator-as-providers pattern works but ceremony is heavier (`preview.tsx` + per-story `decorators` arrays).

### C. Ladle

- Good, because Vite-native, single binary, very fast startup.
- Good, because CSF-compatible — same portability story as Storybook.
- Bad, because still requires migrating slice-559 fixtures to CSF — same tax as Storybook with less ecosystem upside.
- Bad, because the addon and a11y story is even thinner than cosmos's; we lose the existing fixture shape and gain little.

### D. Defer

- Good, because zero new dependency surface, zero config to maintain, zero CI cost.
- Bad, because slice-559 fixtures remain dead code; the kernel discipline relies entirely on lint + reviewer pressure with no visual feedback loop.
- Bad, because every UI iteration boots `apps/website` — the pretty-print of the kernel discipline disappears the moment someone takes the easy path and reaches around the ports.
- Bad, because the visual-regression follow-up (`oh-monorepo-2v7`) has no obvious hook to attach to; we'd have to design that pipeline from scratch instead of riding `cosmos-export`.

## Cross-references

- RFC `oh-monorepo-6mn` — ports & adapters refactor; specifies cosmos config at `packages/client` root + decorator wraps `<Providers ports={createFixturePorts()}>`.
- Ticket `oh-monorepo-su7` — this adoption (closed by the implementation PR; four open questions resolved in `docs/infra/cosmos-adoption.md`).
- Slice 559 (PR #20) — landed `Hero` + `SocialLinks` + co-located `*.fixture.tsx` files this ADR makes live.
- Slice 1ob (PR #18) — Tailwind v4 entry at `packages/client/src/ui/styles.css`; the cosmos decorator imports the same sheet.
- Slice 4ge (PR #34) — oxlint `no-restricted-imports` discipline scoped to `packages/client/src/ui/**`; the cosmos decorator lives at `packages/client/cosmos.decorator.tsx` (outside `src/ui/**`) and imports concrete kernel infra without tripping the rule.
- Follow-up `oh-monorepo-2v7` — Playwright screenshot-tests against `cosmos-export`.
