# Step 2 — Research

> **Skill:** [`improve-codebase-architecture`](../../.claude/skills/improve-codebase-architecture/SKILL.md) — runs the deepening-opportunity exploration described below.
> **Output:** `docs/plans/<feature>/research.md`.

## Why

A wrong PRD costs more than an hour of research. Research separates *what we know* from *what we assume*, and surfaces the constraints that will shape the design before they become bugs.

It is also the cheapest place to kill a bad idea. Many features die here once the real surface area, prior art, or library constraints become visible — that is the point, not a failure.

## When to do it

- Always for new features touching unfamiliar parts of the codebase.
- Always when integrating a third-party library or service for the first time.
- Skip for trivial bug fixes or copy changes — note the skip in the PR.

## What to capture

Keep it short. A research doc that nobody reads is worse than no doc.

1. **Question** — one sentence stating what we are trying to learn.
2. **Findings** — bullet list of facts, with file paths and links.
3. **Constraints** — limits the design must respect (perf, API quotas, existing contracts).
4. **Prior art** — how similar problems are solved in this repo or in referenced projects.
5. **Open questions** — what we still do not know, and how we plan to find out.
6. **Recommendation** — one paragraph: viable, not viable, or "needs prototype."

## How

- Run the [`improve-codebase-architecture`](../../.claude/skills/improve-codebase-architecture/SKILL.md) skill — it drives the exploration, the deletion test, and the candidate list.
- Use `find-docs` (or Context7) for library and API questions — never guess from memory.
- Reference exact file paths with line numbers (`src/foo.ts:42`) so the PRD can cite them.
- Stop when the next finding would not change the recommendation.

## Anti-patterns

- **Research as procrastination.** If you have written more than 500 words and no recommendation, stop and force a decision.
- **Findings without sources.** Every claim needs a file path, link, or experiment to back it.
- **Solutioning in the research doc.** Design belongs in the PRD; research is read-only.
