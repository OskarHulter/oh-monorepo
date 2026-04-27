# 0010. Animation + shader stack — tiered, first-paint disciplined

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

The portfolio site needs "fancy" — ambient backdrops, motion polish, the occasional 3D widget — without paying for a 3D engine on every first paint. WebGL/3D in JS land has a wide cost gradient: a CSS gradient costs nothing, a Paper Shaders backdrop costs a small fragment shader, a react-three-fiber scene costs hundreds of kB of three.js plus draw-call overhead. A single library pick papers over that gradient and either over-builds the landing or under-serves the 3D widgets. The decision is which **tiers** to standardize on, and which is allowed near first paint.

## Decision Drivers

- First-paint discipline: landing FCP/LCP cannot regress for visual polish that has no funnel role.
- Bundle weight per tier should be predictable — pick the lightest tool that can do the job, not the most general.
- React-native ergonomics: the codebase is React 19 + ports/adapters; tools that fit declarative composition cost less to maintain than imperative ones.
- Reversibility: each tier is independently swappable; no single library should hold the whole motion story hostage.
- Spike-friendly: the picks must be cheap to validate on the existing landing slice without rewriting it.

## Considered Options

- **A. Tiered stack** — Paper Shaders for ambient backdrops, Motion for UI motion, react-three-fiber + drei + @react-three/postprocessing reserved for 3D widgets that earn their weight.
- **B. react-three-fiber everywhere** — single 3D engine for backdrops, widgets, transitions.
- **C. Hand-rolled WebGL via OGL or REGL** — minimal library, full control.
- **D. CSS / SVG only** — no WebGL, no three.js, lean on `@property` gradients and SVG filters.
- **E. Hydra / livecoding stack** — visual livecoding for backdrops.

## Decision Outcome

Chosen option: **A — tiered stack**, because it matches the cost gradient of the work to the weight of the tool, and keeps three.js off the first-paint critical path.

Tiers:

| Tier   | Purpose                                                  | Library                                                                 | First-paint allowed?  |
| ------ | -------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------- |
| Tier 1 | Ambient backdrops (noise, gradient, wave)                | Paper Shaders (`@paper-design/shaders-react`)                           | Yes                   |
| Tier 2 | UI motion (page transitions, micro-interactions, layout) | Motion (`motion` — formerly `framer-motion`)                            | Yes                   |
| Tier 3 | 3D widgets / hero scenes that earn their weight          | react-three-fiber + `@react-three/drei` + `@react-three/postprocessing` | **No** — lazy + gated |
| Tier 4 | Drop-in Shadertoy-style fragment shaders (escape hatch)  | shader-doodle                                                           | Case-by-case          |

Rules:

- **No three.js on first paint.** Tier 3 components are always code-split and gated behind viewport / interaction triggers.
- **One motion library.** Motion is the default; GSAP only if a feature genuinely requires GSAP-only capability (e.g. SVG morph, advanced timeline). Mixing both is not allowed.
- **Tier 1 budget.** A Paper Shaders backdrop must not push the landing past the perf budgets in `docs/infra/animation-stack.md`.
- **Tier 3 must justify itself.** Each R3F surface gets a short note in the PR explaining why a 3D widget beats the Tier 1/2 alternative.

### Positive Consequences

- Landing FCP/LCP stay predictable — only Paper Shaders + Motion are reachable from the first-paint chunk.
- Each tier is independently swappable; replacing Motion with GSAP later is a per-component edit, not a stack rewrite.
- Reviewers can challenge a 3D widget on weight grounds without re-litigating the stack.
- Spikes (Tier 1 backdrop, Tier 2 page transition) ship behind the landing slice with no scope creep into 3D.

### Negative Consequences

- Three picks to maintain instead of one — small docs and version-bump cost.
- Tier 3 lazy-loading discipline is a recurring review task; easy to regress if a hero scene gets imported eagerly.
- Paper Shaders is a small library; if it stalls upstream we eat a migration to a hand-rolled or Tier 4 fallback.
- shader-doodle is a custom element, which carries minor SSR/hydration caveats — call it out in component PRs.

## Pros and Cons of the Options

### A. Tiered stack (chosen)

- Good, matches tool weight to job weight; first paint stays cheap.
- Good, each tier is replaceable in isolation.
- Good, picks are React-friendly where it matters (Paper Shaders, Motion, R3F all React-native).
- Bad, three libraries to track and version.

### B. react-three-fiber everywhere

- Good, single mental model and dependency graph.
- Bad, three.js on every page even for a noise backdrop — first-paint regression.
- Bad, pulls a renderer into routes that need a `<canvas>` of pixels, not a scene graph.

### C. Hand-rolled OGL / REGL

- Good, smallest possible WebGL footprint per surface.
- Bad, hand-roll cost per backdrop is real; no premade shader gallery.
- Bad, every surface becomes a bespoke maintenance item; we are not a graphics shop.

### D. CSS / SVG only

- Good, zero JS cost; SSR-trivial.
- Bad, the visual ceiling for "fancy" backdrops is well below what Paper Shaders gives for ~few kB.
- Bad, no path to 3D widgets when one is justified later.

### E. Hydra / livecoding

- Good, expressive for visuals and demos.
- Bad, livecoding tooling is overkill for a portfolio; runtime weight and hydration shape don't fit a static landing.

## Implementation Notes

Captured from `oh-monorepo-cgt`:

- **Picks (ratified).**
  - Paper Shaders (`paper-design/shaders` → `@paper-design/shaders-react`) — premade noise/gradient/wave shaders as React components. Lightest path to fancy backdrops.
  - react-three-fiber + drei + `@react-three/postprocessing` — full 3D + post-FX when a 3D widget or hero scene is justified. Gated, lazy-loaded.
  - Motion (formerly framer-motion) — non-shader UI motion (page transitions, micro-interactions). Default motion library.
  - shader-doodle — Shadertoy-style fragment shaders as a custom element when bringing in pre-existing shaders. Escape hatch.
- **Skipped.**
  - OGL / REGL — tiny WebGL but hand-roll cost too high for ambient FX.
  - Hydra — livecoding overkill for a portfolio site.
  - GSAP as default — Motion's React ergonomics win the default slot; GSAP only for GSAP-only features.
- **Decisions.**
  - One motion lib (Motion). GSAP requires a per-feature note explaining the GSAP-only need.
  - Hero/landing FX: Paper Shaders only. No three.js on first paint.
- **Spike tasks (follow-ups).**
  - Paper Shaders backdrop on the landing page; measure FCP/LCP impact against the budgets in `docs/infra/animation-stack.md`.
  - Motion page transition on a route swap (when the route count justifies it).
  - (Later) R3F widget: small 3D candle or ribbon visual, lazy-loaded behind viewport.

Living reference (tier table, perf budgets, when-to-use guidance, spike status): `docs/infra/animation-stack.md`.

## Cross-references

- `docs/infra/animation-stack.md` — living reference for tiers, budgets, and spike status.
- ADR 0007 — defer Tanstack Start until a dynamic route earns it; same first-paint discipline applies here.
- bd `oh-monorepo-cgt` — evaluation cluster ticket for animation + shader stack (closed by this ADR).
