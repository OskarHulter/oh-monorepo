# Chart libraries — per-surface matrix

> **Designated:** This is the **chart-library area**. Per-surface picks live here. The principle (no single lib for all surfaces) is ratified in [ADR 0011](../adr/0011-per-surface-chart-libraries.md).
>
> Tracked by `oh-monorepo-b4c`. Update in place as surfaces ship and spikes resolve; this file is a living reference, not an immutable decision.

## Why per-surface

- A finance-grade OHLCV chart, a 50k-point indicator line, and a Tailwind dashboard KPI card have different perf budgets and different scope-fits. One MIT lib does not cover all three at the weight we're willing to ship.
- Per-surface ownership keeps the swap cost bounded — replacing one surface's lib doesn't ripple.
- Plotly stays only where existing perf-tuned charts already justify the weight; new surfaces default to the matrix below.

## Per-surface matrix

Lean is the proposed pick. **Committed?** stays `No` until the spike for that surface lands and the team adopts.

| Surface                                       | Library lean                   | License    | Why                                                                                           | Committed? | Follow-up ticket          |
| --------------------------------------------- | ------------------------------ | ---------- | --------------------------------------------------------------------------------------------- | ---------- | ------------------------- |
| Price (OHLCV)                                 | TradingView Lightweight Charts | Apache-2.0 | ~45kb, finance-tuned: candlesticks / area / line / volume pane, crosshair, time-axis built in | No         | `oh-monorepo-b4c` (spike) |
| Indicators / scanners / dense lines           | uPlot                          | MIT        | Fastest pure timeseries; ~45kb; designed for dense line/scatter at 60fps                      | No         | `oh-monorepo-b4c` (spike) |
| Dashboard chrome (KPI cards, simple bar/line) | Tremor                         | Apache-2.0 | Tailwind-native; matches the design system surface; minimal extra theming                     | No         | `oh-monorepo-b4c` (spike) |
| Custom one-offs                               | Visx (D3 + React primitives)   | MIT        | Escape hatch when the four common surfaces don't fit — primitives, not a full chart lib       | No         | none yet                  |
| Existing perf-tuned charts                    | Plotly                         | MIT        | Stay-put unless a touching change makes migration cheap; do not extend to new surfaces        | n/a        | none                      |

## Skipped

| Library              | Why skipped                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ECharts              | Capable but heavier than needed once the four-surface split covers cases; trades the worst-cell tax we want to avoid |
| Recharts             | Easy DX but modest perf; superseded by uPlot for dense lines and Tremor for dashboard chrome                         |
| Highcharts           | Commercial license; fails the MIT/Apache-only driver                                                                 |
| AG Charts Enterprise | Commercial license; same                                                                                             |

## Selection criteria when a new surface arrives

Apply in order. If any answer is "no," try the next lib down.

1. **Does an existing matrix row already cover this surface?** If yes, use it. Don't add a row for variations.
2. **License MIT or Apache-2.0?** Hard gate.
3. **Bundle weight justified by the surface's value?** Marketing chrome has a different budget than a price chart.
4. **Scope-fit native, not faked?** Candlesticks faked from line series is a no.
5. **Theming reachable from Tailwind v4 tokens?** If not, document the gap before committing.
6. **Keyboard / screen-reader story?** A11y is a soft gate — required for surfaces behind login, encouraged elsewhere.

If steps 1–6 don't yield a pick, the surface is a Visx job — file a follow-up ticket and document why.

## Spike tasks (gating commit)

Per ticket `oh-monorepo-b4c`. Each spike unlocks moving the matching row's **Committed?** to `Yes`.

- **TradingView Lightweight Charts** — render OHLCV from a DuckDB-WASM result; benchmark zoom/pan p95 against the perf budget.
- **uPlot** — render a 50k-point indicator line; verify draw time stays under 16ms.
- **Tremor** — KPI card + sparkline composed in a dashboard route; confirm Tailwind v4 token reuse.

## Open questions (resolve at adoption time, not now)

- **Theming surface** — can chart libs read the same Tailwind v4 tokens (palette, radii, type scale) as the rest of the UI? Document the bridge per lib before committing.
- **SSR / static-render** — Tanstack Start static-render compatibility per lib (canvas-based libs need hydration shims; SVG-based don't).
- **Accessibility** — keyboard navigation for chart cursors; screen-reader announcements for value changes. Required for surfaces behind login (per ADR 0004 trust boundaries spirit).
- **Plotly migration trigger** — define the "pays its weight" test concretely once we touch a Plotly chart in anger.

## Cross-references

- [ADR 0011](../adr/0011-per-surface-chart-libraries.md) — ratifies per-surface ownership as the principle.
- `oh-monorepo-b4c` — chart library evaluation cluster; this doc is its living artifact.

## How to update this doc

- A spike resolves → flip **Committed?** to `Yes` and note the date in the changelog.
- A new surface arrives → run the selection criteria, add a row, link the spike ticket.
- A lib gets dropped → move its row to **Skipped** with the reason; do not delete history.
- Plotly migrates a chart → note in the changelog; the row stays for the remaining charts.

## Changelog

- 2026-04-27 — Doc seeded from `oh-monorepo-b4c` notes alongside ADR 0011. No surfaces committed yet; all rows pending spikes.
