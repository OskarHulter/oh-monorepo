# Feature Development Process

Standard cycle for shipping features, refactors, and apps in this repo. Adapted from Matt Pocock's skill-driven workflow.

## Why

Most feature work fails not at the keyboard but at the seams: unclear destination, missing context, untested assumptions, late discovery of risk. This process forces decisions out of heads and into artifacts (research notes, PRDs, kanban issues, plans) so that:

- **Intent is explicit before code** — the PRD is the contract, not the diff.
- **Work is parallelizable** — kanban issues from a PRD let humans and agents pick up slices independently.
- **Review has signal** — code review and human QA each look for different failure modes.
- **Knowledge compounds** — research and ADRs outlive the branch.

Each step maps to a focused skill. Skip a step only when you can name the artifact it would have produced and why you do not need it.

## The Cycle

1. **Idea**
   - Output: one sentence describing the problem and rough shape.
   - Skills: `superpowers:brainstorming`, `superpowers:grill-me`.
2. **[Research](./research.md)**
   - Output: `research.md` with findings, constraints, prior art.
   - Skills: `improve-codebase-architecture`, `find-docs`.
3. **Prototype**
   - Output: throwaway spike or assets for the PRD.
   - Skill: `design-an-interface`.
4. **PRD**
   - Output: `prd.md` describing the destination, not the path.
   - Skill: `write-a-prd`.
5. **Kanban**
   - Output: independently-grabbable issues with dependencies.
   - Skill: `prd-to-issues`.
6. **[Implementation](./implementation.md)**
   - Output: code, tests, ADRs.
   - Skills: `prd-to-plan`, `superpowers:tdd`.
7. **Code Review**
   - Output: diff-level feedback on gaps, risks, design.
   - Skills: `brooks-lint:brooks-review`, `pr-review-toolkit:review-pr`.
8. **[Human QA](./human-qa-of-completed-work.md)**
   - Output: test plan executed by a human.
9. **QA Followups**
   - Output: new issues for defects and gaps.
   - Skill: `triage-issue`.
10. **[Team Review](./team-review.md)**
    - Output: demo, decisions captured, handoff.

## Rules

- **Artifacts live in the repo.** PRDs, research, plans, ADRs all check in alongside code.
- **Beads tracks state.** Use `bd` for issues; do not invent parallel TODO systems.
- **One worktree per feature.** Keeps branches isolated and review focused.
- **Skip with a reason.** Small bug fixes can skip steps 2–5; record that decision in the PR description.
