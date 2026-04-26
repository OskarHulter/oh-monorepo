# R1 Spike — Tanstack Start on `vp`

**Outcome:** GREEN. `vp install` / `vp build` / `vp dev` all work with Tanstack Start RC + Nitro + Tailwind v4 + React 19 on top of vite-plus 0.1.19 (Vite 8.0.8) without any patching, escape hatches, or special CLI invocation.

## Setup

Throwaway scaffold at `apps/website-spike/`:

- `package.json` — direct version pins (no catalog touch): `@tanstack/react-router@^1.168.24`, `@tanstack/react-start@^1.167.49`, `react@^19`, `react-dom@^19`, dev: `@tailwindcss/vite@^4.2.2`, `@vitejs/plugin-react@^6.0.1`, `nitro@^3.0.260311-beta`, `tailwindcss@^4.2.2`.
- `vite.config.ts` — plugin order mirrors the canonical `examples/react/start-basic`: `tailwindcss()`, `tanstackStart({ srcDirectory: 'src' })`, `viteReact()`, `nitro()`.
- `src/router.tsx` — `getRouter()` wrapping `createRouter({ routeTree, defaultPreload: 'intent', scrollRestoration: true })`.
- `src/routes/__root.tsx` — `createRootRoute` with `HeadContent` + `Scripts` and stylesheet link to `app.css?url`.
- `src/routes/index.tsx` — `createFileRoute('/')` with one Tailwind-styled `<main>`.
- `src/styles/app.css` — `@import 'tailwindcss';`.

No app.config.ts, no special preset, no override of vp's Vite invocation.

## What `vp install` did

```text
Done in 9.8s using pnpm v10.33.2
```

- 139 packages added, 53 downloaded. No build errors.
- One unrelated warning: `apps/website` peer mismatch on `@varlock/vite-integration` wanting `varlock@^0.7.2` while root has `0.9.1`. Not caused by the spike.

## What `vp build` did

```text
vite v8.0.8 building client environment for production...
✓ 124 modules transformed.
.output/public/assets/app-*.css      5.32 kB │ gzip:   1.79 kB
.output/public/assets/routes-*.js    0.44 kB │ gzip:   0.27 kB
.output/public/assets/index-*.js   316.53 kB │ gzip: 100.13 kB
✓ built in 212ms

vite v8.0.8 building ssr environment for production...
✓ 101 modules transformed.
node_modules/.nitro/vite/services/ssr/index.js   158.52 kB │ gzip: 39.41 kB
✓ built in 111ms

[nitro] ◐ Building [Nitro] (preset: node-server, compatibility: 2026-04-26)
[nitro] ✔ Generated public .output/public

vite v8.0.8 building nitro environment for production...
✓ 170 modules transformed.
.output/server/index.mjs   11.34 kB │ gzip:  3.70 kB
.output/server/_libs/@tanstack/react-router+...    678.43 kB │ gzip: 141.58 kB
✓ built in 129ms
```

Three Vite environments (client / SSR / nitro) built in ~450 ms total. Default Nitro preset: `node-server`.

## What `vp dev` did

`curl localhost:3000/` returned **HTTP 200, ~2.88 KB**, server-rendered HTML containing:
- `<title>website-spike</title>` from the root route head config.
- `<link rel="stylesheet" href="/src/styles/app.css">` (dev mode, unprocessed).
- `<link rel="stylesheet" href="/@tanstack-start/styles.css?routes=__root__%2C%2F">` (Tanstack-injected dev styles).
- A real `<main>` with the Tailwind classes from `routes/index.tsx`.

SSR works in dev. Hydration not visually verified (curl-only smoke), but the HTML is well-formed and the SSR pipeline executed.

## Decision implications

- **vite-plus is viable for the real `apps/website` rebuild.** No fallback to plain Vite needed for v1.
- **Plugin order is fixed** by Tanstack Start's expectations: `tailwindcss → tanstackStart → viteReact → nitro`. Locking this in the real app's `vite.config.ts`.
- **Default Nitro preset is `node-server`.** Cloudflare Pages target needs a different preset — either `cloudflare-pages` (CF Pages worker), or `static` for full prerender into `.output/public`. Choice depends on whether the landing page goes static-only or keeps SSR. Recommendation: **static preset for v1** (no server runtime cost on CF Pages, simpler cutover).
- **Bundle size baseline:** 100 kB gzip JS for a one-route landing page is heavy if we want pure static. With prerender + the Tanstack Start landing approach, the JS payload could be eliminated for the first paint by configuring prerender — but the hydration script will still ship by default. Tracked as a follow-up.
- **Tailwind v4 dev mode** serves `app.css` raw at `/src/styles/app.css`; production-built version is bundled and hashed. Both work.

## Open questions surfaced (for the real app, not the spike)

1. **Nitro preset selection:** Set `NITRO_PRESET=static` (env) or via `nitro({ preset: 'static' })` in the plugin config? Verify which one Tanstack Start respects.
2. **Prerender route declaration:** how to declare prerender targets — Nitro's `routes` option, Tanstack Start's `prerender` config, or implicit (all reachable routes)?
3. **Hydration vs static islands:** for a true zero-JS landing, do we need to skip Tanstack Start's client hydration entirely? Probably acceptable for the MVP if the landing has no interactivity; revisit when buttons/forms land.
4. **Asset precedence:** the dev HTML had two `<link rel="stylesheet">` entries (ours + Tanstack-injected). Confirm production output has only the deduped, hashed bundle (the build output suggests yes — `app-*.css`).
5. **Edge cases not tested:** API routes / server functions (`createServerFn`), middleware, loader data, varlock env passthrough into route components. None are in scope for the landing-only MVP, but each will hit its own first-contact moment when a real feature lands.

## Carry-overs into the real implementation

- Reuse `vite.config.ts` plugin order verbatim.
- Reuse `src/router.tsx` shape (`getRouter` factory).
- Reuse `__root.tsx` head/links/scripts pattern with the project's metadata via `varlockVitePlugin()` instead of hardcoded title.
- Switch Nitro preset to `static` (or `cloudflare-pages` if SSR-on-edge becomes desirable later).
- Drop `nitro` plugin from devDeps if `static` preset doesn't need it — verify in the real app.

## Throwaway

`apps/website-spike/` is **deliberately throwaway**. It will be deleted in the next phase (alongside the real `apps/website` rebuild). It exists in this PR purely as auditable evidence that the toolchain stack works.
