# 0003. Prevent version drift

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

Five workspace packages share a handful of deps (zod, pino, playwright, rimraf, vite-plus). Without central pinning, every `vp add` risks introducing a slightly different version per package — invisible until a bug reproduces in only one.

## Decision Drivers

- One source of version truth
- Detect or prevent accidental bypass
- Prune stale entries automatically as code evolves
- Prefer workspace-local packages over registry copies

## Considered Options

- No catalog — trust conventions
- Syncpack or hand-rolled version-alignment scripts
- Renovate strict-grouping rules
- pnpm `catalog:` protocol in `pnpm-workspace.yaml`

## Decision Outcome

Chosen option: **pnpm catalog**, with `catalogMode: prefer`, `cleanupUnusedCatalogs: true`, `linkWorkspacePackages: true`, `preferWorkspacePackages: true`.

### Positive Consequences

- Shared versions bumped in one file
- `catalogMode: prefer` warns when a package pins directly
- Unused entries prune themselves as consumers change

### Negative Consequences

- Auto-cleanup removes entries still referenced by `overrides`, producing `ERR_PNPM_CATALOG_IN_OVERRIDES` on next install — overrides must track catalog presence

## Pros and Cons of the Options

### No catalog

- Bad, because version drift is guaranteed at N>1 packages

### Syncpack / scripts

- Good, because works across package managers
- Bad, because extra tool, extra CI job, extra failure mode

### pnpm catalog

- Good, because native to the PM we already use
- Good, because cleanup/linking flags are free wins
- Bad, because overrides coupling (see negative above)
