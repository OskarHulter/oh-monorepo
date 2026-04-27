# Cosmos adoption — `@oh/client/ui` component sandbox

> Living reference. Principle ratified in [ADR 0017](../adr/0017-adopt-react-cosmos.md). Closes ticket `oh-monorepo-su7`.

This doc resolves the four open questions left by ticket `oh-monorepo-su7` and pins the wiring that ADR 0017 deliberately keeps out of the ADR. Update this file as cosmos's role grows; ADR 0017 stays frozen.

## Resolved open questions

| Question                                              | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Why                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Config layout** in a monorepo (root vs per-package) | Per-package: `packages/client/cosmos.config.json` (+ `packages/client/cosmos.vite.config.ts`).                                                                                                                                                                                                                                                                                                                                                          | Cosmos's `rootDir` walk and decorator discovery are relative; co-locating config with the package keeps the walk local to `packages/client/src/ui` and lets future packages adopt sibling cosmos configs without cross-talk.                                                                                                                                                                                                                                                    |
| **Decorator strategy** for context providers          | Single decorator at `packages/client/src/ui/cosmos.decorator.tsx` wraps every fixture with `<Providers ports={createFixturePorts()}>`.                                                                                                                                                                                                                                                                                                                  | Discovery is a glob — cosmos picks up every `**/cosmos.decorator.{ts,tsx,js,jsx}` under `rootDir` and applies them top-down. One decorator at the `src/ui` root applies to every fixture; per-feature decorators can layer in later by dropping a sibling decorator next to the feature folder. The kernel discipline (RFC `oh-monorepo-6mn`) is the path of least resistance; switching seeds is a fixture-local override (the inner `<Providers>` wins over the decorator's). |
| **Tailwind v4 token loading**                         | Decorator imports `@oh/client/ui/styles.css`; `cosmos.vite.config.ts` ships `@tailwindcss/vite`.                                                                                                                                                                                                                                                                                                                                                        | Single Tailwind source per slice 1ob — the same sheet `apps/website` consumes. The cosmos vite config exists separately from `vite.config.ts` because the latter drives `vp pack` (library build) with `vite-plus`'s `defineConfig` shape, which vanilla Vite (the runtime cosmos uses) ignores.                                                                                                                                                                                |
| **Hooks harness** for `features/**`                   | Deferred. Cosmos is component-focused; a hook needs a host component to render. Until a complex hook in `features/**` justifies a sandbox, hook fixtures stay covered by Vitest browser tests. When the first complex hook arrives, file a follow-up that proposes either a thin "host fixture" pattern (a component fixture that drives the hook through props/buttons) or a different harness (e.g., Vitest browser mode with React Testing Library). | Avoid building a sandbox class for a use case we don't have yet. The first concrete hook will surface the right shape.                                                                                                                                                                                                                                                                                                                                                          |

## File layout

```
packages/client/
  cosmos.config.json              # cosmos discovery + vite renderer wiring
  cosmos.vite.config.ts           # plain-Vite config the cosmos plugin reads
  package.json                    # devDeps + scripts.cosmos / scripts.cosmos:export
  src/
    providers.tsx                 # exports <Providers>
    adapters/fixture/index.tsx    # exports createFixturePorts()
    ui/
      cosmos.decorator.tsx        # auto-discovered; wraps every fixture
      styles.css                  # imported by the decorator (Tailwind v4 entry)
      components/
        hero/
          hero.tsx
          hero.fixture.tsx        # default-export JSX
        social-links/
          social-links.tsx
          social-links.fixture.tsx
      features/                   # hooks; no fixtures yet (deferred)
```

## How discovery resolves

- `cosmos.config.json` sets `rootDir: "src/ui"` and `watchDirs: ["src/ui"]` so cosmos only scans the UI surface.
- Fixture pattern is the suffix form: `**/*.fixture.{ts,tsx,js,jsx}` (set via `fixtureFileSuffix: "fixture"`). The `__fixtures__/` directory pattern is unused — slice 559 already shipped suffix-form fixtures.
- Decorator pattern is the cosmos default `**/cosmos.decorator.{ts,tsx,js,jsx}`. The single decorator at `src/ui/cosmos.decorator.tsx` applies to every fixture under `src/ui` because cosmos walks decorators top-down from `rootDir`.

## Vite seam

`vite-plus` wraps Vite via the `pnpm-workspace.yaml` override `vite: npm:@voidzero-dev/vite-plus-core@latest` plus `peerDependencyRules.allowAny: [vite]`. `react-cosmos-plugin-vite` peers `vite: *`, so it resolves to vite-plus-core too. Risk: a vite-plus-core API drift could break cosmos's plugin without warning. Mitigation: the script lives in `packages/client` only — a break is isolated to `pnpm cosmos` from inside the package, not production.

`vite.config.ts` (vite-plus) and `cosmos.vite.config.ts` (plain Vite) are intentionally two files:

- `vite.config.ts` uses `vite-plus`'s `defineConfig` (with `pack`, `lint`, `fmt`, `staged` keys) — drives `vp pack` library build via tsdown.
- `cosmos.vite.config.ts` uses plain Vite's `defineConfig` with `@vitejs/plugin-react` + `@tailwindcss/vite` — what cosmos's vite renderer wants.
- `cosmos.config.json` points `vite.configPath` at the second file so the first file's vite-plus-specific keys don't reach cosmos.

## Running cosmos

From `packages/client`:

```bash
pnpm cosmos              # cosmos dev playground (default port 5000) + vite renderer (5050)
pnpm cosmos:export       # static export to packages/client/cosmos-export/
```

The scripts use the bundled `cosmos` / `cosmos-export` bin from `react-cosmos`. They do **not** route through `vp run cosmos` — `vp` doesn't wrap cosmos and doesn't need to; cosmos is a self-contained dev server.

To run from the workspace root: `pnpm --filter @oh/client cosmos`.

## Convention to enforce

| Component complexity         | Required fixtures                                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Simple (e.g. `Hero`)         | One `*.fixture.tsx` covering a representative state.                                                                                                       |
| Complex (e.g. `SocialLinks`) | Multiple fixtures covering: `loading`, `empty`, `error`, `saturated`, and at least one `accessibility-edge` case (long labels, RTL, reduced motion, etc.). |

Fixtures live next to the component (`Component.tsx` + `Component.fixture.tsx`). Variant fixtures use a suffix: `social-links.empty.fixture.tsx`, `social-links.error.fixture.tsx`, etc. Cosmos picks up all of them via the `*.fixture.{ts,tsx}` glob.

### Lint enforcement (deferred)

The "every exported component in `packages/client/src/ui/components/**` must have a sibling `*.fixture.tsx`" rule is not yet enforced. Filed as a follow-up. Until then, the convention is reviewer-enforced. A simple precommit hook (`find packages/client/src/ui/components -name '*.tsx' -not -name '*.fixture.tsx' -not -name 'cosmos.decorator.tsx'` cross-checked against fixture-file list) would unblock — see follow-up ticket on `oh-monorepo-su7`.

## Operating notes

- **Existing fixtures are live as-is.** Slice 559's `hero.fixture.tsx` and `social-links.fixture.tsx` use the cosmos-compatible default-export-JSX shape. No migration required.
- **Decorator double-wrap is benign.** `social-links.fixture.tsx` already wraps `<Providers>` inline; the decorator's outer `<Providers>` is overridden by the inner one (React context resolves to the nearest provider). Inline wraps are a fixture-local override seam — keep them when a fixture needs different ports than the decorator's defaults.
- **Decorator is in `src/ui/**`.** Slice 4ge's oxlint `no-restricted-imports`rule bans`@sentry/_`, `@duckdb/_`, `@cloudflare/\*`, and `@tanstack/react-router`under`src/ui/\*\*`. The decorator imports `Providers`(kernel) and`createFixturePorts` (fixture adapter) — both internal, neither banned. No lint exception needed.
- **Cosmos config is JSON, not TS.** The cosmos schema is JSON Schema; `cosmos.config.json` is the canonical filename. RFC `oh-monorepo-6mn`'s "`cosmos.config.ts`" callout was loose — the real file is `.json`.

## Follow-ups

- Lint rule / CI check: every exported component under `packages/client/src/ui/components/**` must have a sibling `*.fixture.tsx`.
- Cosmos export deploy hook → CF Pages preview (drop `cosmos-export/` onto a project for static visual review).
- Hook harness for `features/**` once a complex hook needs a sandbox.
- Visual regression via Playwright screenshot-tests against `cosmos-export` (cross-link `oh-monorepo-2v7`).
