# Feature Development Process

Standard cycle for shipping features, refactors, and apps in this repo. Adapted from Matt Pocock's skill-driven workflow ([source](https://github.com/mattpocock/skills)).

> **Skills live in [`.claude/skills/`](../../.claude/skills/README.md).** Each step below links the skill that runs it. The plan docs cover *when* and *why* to use a step in the cycle; the SKILL.md covers *how*.

## Why

Most feature work fails not at the keyboard but at the seams: unclear destination, missing context, untested assumptions, late discovery of risk. This process forces decisions out of heads and into artifacts (research notes, PRDs, kanban issues, plans) so that:

- **Intent is explicit before code** — the PRD is the contract, not the diff.
- **Work is parallelizable** — kanban issues from a PRD let humans and agents pick up slices independently.
- **Review has signal** — code review and human QA each look for different failure modes.
- **Knowledge compounds** — research and ADRs outlive the branch.

Each step maps to a focused skill. Skip a step only when you can name the artifact it would have produced and why you do not need it.

## The Cycle

1. **Idea**
   - Skill: [`grill-me`](../../.claude/skills/grill-me/SKILL.md) — interview yourself or a teammate to surface assumptions.
   - Output: one sentence on the problem and rough shape.
2. **[Research](./research.md)**
   - Skill: [`improve-codebase-architecture`](../../.claude/skills/improve-codebase-architecture/SKILL.md) — find deepening opportunities and friction.
   - Output: `research.md` with findings, constraints, prior art.
3. **Prototype**
   - Skill: [`design-an-interface`](../../.claude/skills/design-an-interface/SKILL.md) — generate competing interface designs in parallel.
   - Output: throwaway spike or interface sketch for the PRD.
4. **PRD**
   - Skill: [`to-prd`](../../.claude/skills/to-prd/SKILL.md) — synthesise context into a PRD without re-interviewing.
   - Output: `prd.md` describing the destination, not the path.
5. **Kanban**
   - Skill: [`to-issues`](../../.claude/skills/to-issues/SKILL.md) — break the PRD into vertical-slice beads issues.
   - Output: independently-grabbable issues with honest dependencies.
6. **[Implementation](./implementation.md)**
   - Skill: [`tdd`](../../.claude/skills/tdd/SKILL.md) — red-green-refactor by tracer bullet, one slice at a time.
   - Output: code, tests, ADRs.
7. **Code Review**
   - Skills: `brooks-lint:brooks-review`, `pr-review-toolkit:review-pr` (no upstream Pocock skill maps cleanly here).
   - Output: diff-level feedback on gaps, risks, design.
8. **[Human QA](./human-qa-of-completed-work.md)**
   - Skill: [`qa`](../../.claude/skills/qa/SKILL.md) — interactive session, durable issues from findings.
   - Output: executed test plan and a list of new issues.
9. **QA Followups**
   - Skill: [`triage-issue`](../../.claude/skills/triage-issue/SKILL.md) — root-cause a defect and file a TDD fix plan.
   - Output: triaged beads issues, ready to claim.
10. **[Team Review](./team-review.md)**
    - Skill: none — process step, owned by humans.
    - Output: demo, decisions captured, handoff.

## Rules

- **Artifacts live in the repo.** PRDs, research, plans, ADRs all check in alongside code.
- **Beads tracks state.** Use `bd` for issues; do not invent parallel TODO systems.
- **One worktree per feature.** Keeps branches isolated and review focused.
- **Skip with a reason.** Small bug fixes can skip steps 2–5; record that decision in the PR description.
