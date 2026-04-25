# 0006. CI risk mitigation

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

GitHub Actions defaults are permissive: mutable major tags (`@v4`), broad `GITHUB_TOKEN` scopes, credentials persisted to git config by `actions/checkout`. The labeler workflow additionally requires `pull_request_target`, a trigger commonly misused into full repo compromise.

## Decision Drivers

- Supply-chain attack surface from third-party actions
- Least-privilege for the auto-provided `GITHUB_TOKEN`
- Well-known `pull_request_target` pitfalls when PR code is executed
- Readability — future us should understand the pin at a glance

## Considered Options

- Keep defaults (mutable tags, broad perms)
- Pin major version tag only (`@v4`)
- Pin commit SHA with `# vX.Y.Z` trailing comment
- Vendor the actions

## Decision Outcome

Chosen option: **SHA pin + version comment**, combined with top-level `permissions: contents: read`, `persist-credentials: false` on `actions/checkout`, event-type filters, and a rule that no workflow checks out PR code under `pull_request_target`.

### Positive Consequences

- Dependabot/Renovate reads the `# vX.Y.Z` comment and proposes bumps; we approve each one
- `GITHUB_TOKEN` starts at `contents: read`, scoped up explicitly per workflow (e.g. labeler gets `pull-requests: write`)
- `persist-credentials: false` prevents token leaks through the local git config

### Negative Consequences

- Bumping an action version is a two-step write (SHA + comment)
- `zizmor` still warns on `pull_request_target` structurally; warning is accepted because no PR code is checked out

## Pros and Cons of the Options

### Defaults

- Good, because zero work
- Bad, because mutable tags and broad perms are the default attack vector

### Major-tag pin

- Good, because easy to read
- Bad, because tag is mutable — upstream can retag silently

### SHA pin + version comment

- Good, because immutable and still readable
- Good, because bots can still surface upgrades
- Bad, because the two-line format is slightly awkward

### Vendor

- Good, because full control
- Bad, because maintenance burden dwarfs the benefit
