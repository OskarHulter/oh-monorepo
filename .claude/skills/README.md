# Project Skills

Skills available to agents working in this repo. Each skill lives in its own directory with a `SKILL.md` file and is auto-discoverable by Claude Code (and compatible agent harnesses) via the `.claude/skills/` convention.

## Origin

Most skills here are distilled from [Matt Pocock's skills repo](https://github.com/mattpocock/skills) (MIT). Each `SKILL.md` links its upstream source. Distilled means:

- Same intent and process
- Tighter wording
- References rewired to this repo (`docs/plans/`, `docs/adr/`, beads instead of `gh issue`)

## Index

- [`caveman`](./caveman/SKILL.md) — terse communication mode
- [`grill-me`](./grill-me/SKILL.md) — relentless plan interview (step 1)
- [`improve-codebase-architecture`](./improve-codebase-architecture/SKILL.md) — research deepening opportunities (step 2)
- [`design-an-interface`](./design-an-interface/SKILL.md) — generate competing interface designs (step 3)
- [`to-prd`](./to-prd/SKILL.md) — synthesise context into a PRD (step 4)
- [`to-issues`](./to-issues/SKILL.md) — break a PRD into vertical-slice issues (step 5)
- [`tdd`](./tdd/SKILL.md) — red-green-refactor by tracer bullet (step 6)
- [`qa`](./qa/SKILL.md) — interactive human QA, file issues from findings (step 8)
- [`triage-issue`](./triage-issue/SKILL.md) — root-cause a defect, file a TDD fix plan (step 9)

The feature dev process that ties these together: [`docs/plans/README.md`](../../docs/plans/README.md).

## Issue tracking

Pocock's upstream skills create GitHub issues with `gh issue create`. This repo uses [beads (`bd`)](https://github.com/orgs/repo/beads) instead. When a skill says "file an issue," use `bd create --title="..." --description="..." --type=task|bug|feature` and reference the returned ID.

## Adding a skill

1. Create `.claude/skills/<name>/SKILL.md` with frontmatter (`name`, `description`).
2. Link it from this README.
3. If it adapts an upstream skill, link the source at the top of `SKILL.md`.
