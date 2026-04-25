---
"oh-monorepo": patch
---

Switch release pipeline from release-drafter to Changesets. Per-package versioning + changelogs for the pnpm monorepo. Adds `.changeset/` config, root scripts (`changeset`, `version-packages`), and `.github/workflows/release.yml` (changesets/action). Removes `.github/release-drafter.yml` and `.github/workflows/release-drafter.yml`.
