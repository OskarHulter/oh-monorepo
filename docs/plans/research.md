# Step 2 — Research

> **Skill:** [`improve-codebase-architecture`](../../.claude/skills/improve-codebase-architecture/SKILL.md)
> **Output:** `docs/plans/<feature>/research.md`

## Why

A wrong PRD costs more than an hour of research. Research is also the cheapest place to kill a bad idea — surface real surface area, prior art, and library constraints before they become design decisions.

## When to do it

- New features touching unfamiliar code
- First-time integration with a third-party library or service
- Skip for trivial fixes; note the skip in the PR

## What to capture

1. **Question** — one sentence on what we are trying to learn
2. **Findings** — bullets, each with file paths or links
3. **Constraints** — perf, quotas, existing contracts
4. **Prior art** — similar problems already solved here or elsewhere
5. **Open questions** — what we don't know, plus how we'll find out
6. **Recommendation** — viable, not viable, or "needs prototype"

## How

- Run [`improve-codebase-architecture`](../../.claude/skills/improve-codebase-architecture/SKILL.md) for codebase questions
- Use `find-docs` (or Context7) for library and API questions — never guess
- Cite exact file paths with line numbers (`src/foo.ts:42`)
- Stop when the next finding would not change the recommendation
