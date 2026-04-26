# Project Skills

Skills available to agents working in this repo. Each skill lives in its own directory with a `SKILL.md` file and is auto-discoverable by Claude Code (and compatible agent harnesses) via the `.claude/skills/` convention.

## Origin

Most skills here are distilled from [Matt Pocock's skills repo](https://github.com/mattpocock/skills) (MIT) — same intent, tighter wording, references rewired to this repo. Each `SKILL.md` links its upstream source.

## Index

- [`caveman`](./caveman/SKILL.md) — terse communication mode
- [`grill-me`](./grill-me/SKILL.md) — relentless plan interview (step A)
- [`improve-codebase-architecture`](./improve-codebase-architecture/SKILL.md) — research deepening opportunities (step B)
- [`design-an-interface`](./design-an-interface/SKILL.md) — generate competing interface designs (step C)
- [`to-prd`](./to-prd/SKILL.md) — synthesise context into a PRD (step D)
- [`to-issues`](./to-issues/SKILL.md) — break a PRD into vertical-slice issues (step E)
- [`tdd`](./tdd/SKILL.md) — red-green-refactor by tracer bullet (step F)
- [`qa`](./qa/SKILL.md) — interactive human QA, file issues from findings (step H)
- [`triage-issue`](./triage-issue/SKILL.md) — root-cause a defect, file a TDD fix plan (step I)

Full dev process: [`docs/feature-dev-process/README.md`](../../docs/feature-dev-process/README.md).

## How to invoke

- **Claude Code:** auto-loaded — invoke via the `Skill` tool or mention by name.
- **Other harnesses:** paste the relevant `SKILL.md` into the conversation.

## Issue tracking

This repo uses [beads (`bd`)](https://github.com/steveyegge/beads) but GitHub Issues is the established alternative.

## Adding a skill

1. **Check for an installed plugin first.** If the same skill ships in a plugin you already enable (`enabledPlugins` in settings), prefer the plugin and skip authoring a project copy. A project skill with the same name shadows the plugin's version, and a thinner local copy will under-deliver.
2. Create `.claude/skills/<name>/SKILL.md` with frontmatter (`name`, `description`).
3. Link it from this README.
4. If it adapts an upstream skill, link the source at the top of `SKILL.md`.

> **Finding (2026-04-25):** the `caveman` plugin is installed for this user, so `.claude/skills/caveman/SKILL.md` would shadow the richer plugin version. We kept a near-verbatim copy of the upstream (minus wenyan modes) so the skill works without the plugin too — but treat this as the exception, not the pattern.
