# 0002. Unify dev tooling

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

A typical TS monorepo pins Vite, Vitest, Oxlint, Oxfmt, tsdown, and a package manager separately. Each ships its own config, upgrade cadence, and CI setup step. Version drift between them is the norm, not the exception.

## Decision Drivers

- One upgrade path, not five
- Minimise config surface across packages
- Fast CI setup (single action instead of a chain)
- Consistent formatting/lint/test behaviour across the workspace

## Considered Options

- Vite + Vitest + Oxlint + Oxfmt installed and pinned individually
- Turborepo orchestrating the above
- Nx
- Vite+ (`vp`) — VoidZero's bundled toolchain

## Decision Outcome

Chosen option: **Vite+ (vp)**, because it bundles every tool we'd otherwise wire individually under one CLI and catalog pin, and `voidzero-dev/setup-vp` collapses CI setup to a single step.

### Positive Consequences

- `vp upgrade` moves the whole stack in lockstep
- Shared `vite.config.ts` shape for dev/build/test/lint/fmt
- One devDep (`vite-plus`) replaces five or more

### Negative Consequences

- Inherit vp's limitations — e.g. oxlint's JS-plugin runtime isn't wired through `vp lint`, so ESLint plugins (like `eslint-plugin-zod`) can't be loaded via the vp-native pipeline
- Moving off vp later means reintroducing individual pins

## Pros and Cons of the Options

### Individual tools

- Good, because maximum control and community support per tool
- Bad, because five drift paths and five CI steps

### Turborepo / Nx

- Good, because mature monorepo orchestration
- Bad, because still leaves each tool's install/config separate — solves task graph, not tool sprawl

### Vite+ (vp)

- Good, because single install, single config, single CI action
- Bad, because newer, fewer escape hatches
