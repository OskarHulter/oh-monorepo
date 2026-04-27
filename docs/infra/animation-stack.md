# Animation + shader stack

> **Living reference** for the tiered animation and shader stack ratified in [ADR 0010](../adr/0010-animation-shader-stack.md). Tracked by `oh-monorepo-cgt`. Update in place as spikes land, perf budgets shift, or a tier picks up a new library. Decisions about _which_ tiers exist and the first-paint rule live in the ADR; this file tracks _how_ we use them.

## Why a tiered stack

- Tools have wildly different weight: a fragment shader backdrop costs a few kB; a react-three-fiber scene drags in three.js (~hundreds of kB) plus renderer overhead.
- Forcing one library to cover every surface either over-builds the landing or under-serves 3D widgets.
- A tiered stack lets reviewers reason about cost per surface and challenge weight without re-litigating the stack.
- First-paint discipline is preserved by gating Tier 3 (3D) behind code-splitting and viewport / interaction triggers.

## Tier table

| Tier   | Purpose                                                  | Library                                                                    | First-paint? | Status                       |
| ------ | -------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ | ---------------------------- |
| Tier 1 | Ambient backdrops (noise, gradient, wave)                | `@paper-design/shaders-react`                                              | Yes          | Pre-spike — landing slice    |
| Tier 2 | UI motion (page transitions, micro-interactions, layout) | `motion` (formerly `framer-motion`)                                        | Yes          | Pre-spike — first route swap |
| Tier 3 | 3D widgets / hero scenes that earn their weight          | `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` | Lazy + gated | Deferred — no surface yet    |
| Tier 4 | Drop-in Shadertoy-style fragment shaders (escape hatch)  | `shader-doodle`                                                            | Case-by-case | Escape hatch — not adopted   |

## When to use which

- **Reach for Tier 1 first** for any ambient/background visual. If a noise/gradient/wave shader can do it, that's the answer.
- **Reach for Tier 2** for any non-shader motion: page transitions, hover/press feedback, layout animations, scroll-linked motion.
- **Tier 3 requires justification.** Before adding an R3F surface, answer in the PR description:
  1. Why does this need a scene graph instead of a fragment shader?
  2. How is it lazy-loaded and gated (viewport, interaction, route)?
  3. Does it regress the page's perf budget when active?
- **Tier 4 is for drop-ins only.** Pre-existing Shadertoy fragment shaders we want to embed without re-authoring as a Paper Shaders preset. Note the custom-element / hydration caveat in the component PR.

## First-paint rules

- **No three.js (Tier 3) on first paint.** Always code-split. Always gated behind a trigger (viewport, interaction, route).
- **One motion library.** Motion is the default. GSAP is only allowed when a feature requires GSAP-only capability (e.g. SVG morph, advanced timelines) — and only for that feature, with a note in the component PR.
- **Tier 1 backdrops respect the perf budget** below; if a backdrop blows the budget, drop a frame, simplify the shader, or move it off the landing.
- **Respect `prefers-reduced-motion`** at every tier. Tier 1 backdrops should freeze or fall back to a static gradient; Tier 2 transitions should collapse to instant; Tier 3 should disable animation loops.

## Perf budgets (landing route)

These are guardrails, not contracts; revisit if the landing's purpose changes. Measured against the v1 landing on the spec'd reference profile.

| Metric                       | Budget             | Notes                                                               |
| ---------------------------- | ------------------ | ------------------------------------------------------------------- |
| FCP (4G mobile)              | ≤ 1.5 s            | Hard ceiling. Tier 1 backdrop cannot push past this.                |
| LCP (4G mobile)              | ≤ 2.5 s            | Tier 1 backdrop is `<canvas>`-backed; LCP element is the hero copy. |
| TBT (4G mobile)              | ≤ 200 ms           | Watch shader compile + Motion init.                                 |
| First-paint JS (gz)          | ≤ 60 kB            | Includes React + Tier 1 + Tier 2; excludes Tier 3 (lazy).           |
| Tier 1 incremental cost (gz) | ≤ ~10 kB           | Paper Shaders + one shader preset.                                  |
| Tier 2 incremental cost (gz) | ≤ ~15 kB           | Motion core; tree-shake unused features.                            |
| Tier 3 chunk (gz, when used) | ≤ 200 kB per scene | Always lazy; never reachable from first paint.                      |

Read these as soft targets to defend in PR review. If a budget is breached, the PR either lowers the cost, justifies the breach in writing, or splits the surface to a later route.

## Spike tasks

Pulled from `oh-monorepo-cgt`. Each spike validates one tier on the existing landing slice — no scope creep.

- [ ] **Tier 1 — Paper Shaders backdrop on landing.** Wire `@paper-design/shaders-react` into the hero. Pick one preset (noise or gradient). Measure FCP / LCP / TBT before vs after. Confirm `prefers-reduced-motion` fallback. Land or revert based on the budget table above.
- [ ] **Tier 2 — Motion page transition on a route swap.** Defer until the route count justifies it (≥ 2 routes worth animating between). Measure TBT impact and confirm transition collapses under `prefers-reduced-motion`.
- [ ] **Tier 3 — R3F widget.** (Later, only when a surface earns it.) Candidate: small 3D candle or ribbon visual. Lazy-loaded behind viewport. Document the justification in the component PR per the Tier 3 rule.

Update this section as spikes start / land / get retired. Keep the perf numbers in the spike's PR description; this file just tracks status.

## Cross-references

- [ADR 0010](../adr/0010-animation-shader-stack.md) — load-bearing decision for the tiered stack.
- [ADR 0007](../adr/0007-defer-tanstack-start.md) — defer Tanstack Start until a dynamic route earns it; same first-paint discipline.
- bd `oh-monorepo-cgt` — evaluation cluster ticket (closed when ADR 0010 ships; this doc lives on).

## Changelog

- 2026-04-27 — Doc seeded from ADR 0010 + `oh-monorepo-cgt`. No spikes started yet; tiers + budgets captured for the landing route.
