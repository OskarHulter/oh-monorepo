---
'@oh/client': patch
---

feat(client): adopt react-cosmos for component isolation (ADR 0017 + su7)

Wires `react-cosmos@^7.3.0` + `react-cosmos-plugin-vite@^7.3.0` as a dev-only
sandbox for `@oh/client/ui`. Adds `cosmos.config.json` (per-package, `rootDir:
src/ui`), a plain-Vite `cosmos.vite.config.ts` (so the cosmos plugin doesn't
fight `vite-plus`'s `defineConfig` shape), and `src/ui/cosmos.decorator.tsx`
which wraps every fixture with `<Providers ports={createFixturePorts()}>` and
imports `@oh/client/ui/styles.css` so Tailwind v4 tokens load. Existing
slice-559 fixtures (`hero.fixture.tsx`, `social-links.fixture.tsx`) become
live with no migration.

ADR 0017 ratifies the principle; `docs/infra/cosmos-adoption.md` resolves the
four open questions (config layout, decorator strategy, Tailwind wiring,
hooks harness).
