# 0011. Per-surface ownership for chart libraries (no single lib for all surfaces)

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

We need a charting story for the website + future dashboards. Surfaces have very different constraints — finance-grade OHLCV interactions, dense indicator timeseries, dashboard KPI chrome, and the occasional custom one-off. A single library that covers all four well does not exist at MIT-licensed sizes we want to ship to the browser. Do we pick one lib and live with the worst cell, or accept a small federation?

## Decision Drivers

- **Performance per surface** — OHLCV pan/zoom, dense lines (50k+ points), and dashboard chrome have different perf budgets; one budget number doesn't fit
- **License** — MIT/Apache only; no commercial-license dependencies (Highcharts, AG Charts Enterprise)
- **Bundle weight** — each surface pays for what it uses; no 300kb generalist lib loaded on a marketing page
- **Scope-fit** — financial primitives (candles, volume pane, crosshair) are first-class for the price surface; KPI cards are first-class for dashboards; neither lib should fake the other
- **Reversibility** — easier to swap one surface's lib than to migrate a monolith
- **Theming + a11y** — must survive Tailwind v4 token sharing and keyboard nav (open questions, not blockers)

## Considered Options

- **A. Per-surface ownership** — pick the best-fit lib per surface; document the matrix; no global default
- **B. One generalist (ECharts)** — single dep, broad coverage; eat the weight + scope mismatches
- **C. One lightweight (Recharts)** — easy DX, React-native; accept perf ceiling
- **D. One commercial (Highcharts / AG Charts Enterprise)** — broadest surface, paid license
- **E. Keep Plotly everywhere** — status quo; don't migrate

## Decision Outcome

Chosen option: **A — per-surface ownership**, because no single MIT lib hits the perf, scope, and weight bar across all four surfaces, and a small federation costs less than the worst-cell tax of any monolith. The per-surface picks live in [`docs/infra/chart-libraries.md`](../infra/chart-libraries.md) as a living matrix — not in this ADR — so the principle stays stable while the picks can evolve as surfaces are added or spikes change our minds.

Plotly is not banned — it stays where existing perf-tuned charts already justify the weight. New surfaces default to the matrix.

### Positive Consequences

- Each surface ships the lib that fits its constraints; no surface eats another's tax.
- Spikes are scoped (one lib, one surface) instead of "evaluate generalist X."
- Bundle weight is per-route, not global. Marketing pages don't pay for OHLCV primitives.
- Adding a fifth surface is a matrix row, not an ADR rewrite.

### Negative Consequences

- Multiple deps to keep current; multiple theming surfaces to reconcile against Tailwind v4 tokens.
- Engineers must consult the matrix before reaching for a chart — a small process tax.
- Cross-surface visual consistency requires explicit theming work (open question, tracked in the living doc).

## Pros and Cons of the Options

### A. Per-surface ownership

- Good, each surface gets a lib sized for its constraints (perf, scope, weight)
- Good, swap cost is bounded to one surface
- Good, license stays MIT/Apache by composition
- Bad, N libs to track, theme, and upgrade
- Bad, requires a living matrix (this is what `docs/infra/chart-libraries.md` is for)

### B. One generalist (ECharts)

- Good, single dep, single mental model
- Good, very capable across most surfaces
- Bad, ~1MB-class bundle weight before tree-shaking; unjustified for marketing chrome and dashboard KPIs
- Bad, OHLCV interactions are competent but not finance-tuned the way TradingView LC is
- Bad, trades the worst-cell tax we're trying to avoid

### C. One lightweight (Recharts)

- Good, React-native, small API surface, fast to ship
- Bad, perf ceiling on dense timeseries — superseded by uPlot for the indicator surface
- Bad, dashboard chrome is better served by Tailwind-native primitives (Tremor)
- Bad, no finance-grade OHLCV story

### D. One commercial (Highcharts / AG Charts Enterprise)

- Good, broadest single-vendor coverage
- Bad, license cost recurring — fails the "no commercial deps" driver
- Bad, vendor lock-in worse than the federation cost we're trying to dodge

### E. Keep Plotly everywhere

- Good, zero migration cost
- Bad, Plotly weight is unjustified outside surfaces where perf-tuned charts already exist
- Bad, no finance primitives; OHLCV is reimplemented from scatter
- Bad, doesn't answer "what does a new surface use?"

## Implementation Notes

- This ADR ratifies the **principle**. The per-surface picks (libraries, why, committed-state, follow-up tickets) live in [`docs/infra/chart-libraries.md`](../infra/chart-libraries.md).
- No chart lib is installed by this PR. Adoption happens per surface, gated on the spike tasks listed in the living doc.
- Plotly migration is opportunistic — only when an existing chart is being touched anyway, or when its weight stops being justified.
- Open questions (Tailwind v4 theming, SSR/static-render, a11y / keyboard nav) are tracked in the living doc and resolved at adoption time, not now.
- Tracked by `oh-monorepo-b4c`.
