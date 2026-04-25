# Step 6 — Implementation

> **Skill:** [`tdd`](../../.claude/skills/tdd/SKILL.md) — runs the red-green-refactor loop slice by slice.
> **Output:** code, tests, ADRs; one PR per kanban issue (or tight group).

## Why

Implementation is where the PRD meets reality. The goal is not "write the code" — it is to land each kanban slice with verifiable success criteria, so review and QA have something concrete to check. Test-first execution keeps the loop honest: every change is justified by an issue, every issue is closed by a green test.

## The loop

For each ready issue:

1. **Claim it.** `bd update <id> --claim` and move to in-progress.
2. **Worktree it.** One worktree per slice, branched from `main`. Avoids cross-contamination during review.
3. **Run the [`tdd`](../../.claude/skills/tdd/SKILL.md) skill.** Plan behaviours, then loop one tracer bullet at a time: red, green, repeat. Refactor only on green.
4. **Verify.** Run `vp check` and `vp test`. Do not declare done until both pass.
5. **ADR if non-obvious.** Record any non-trivial design decision under `docs/adr/`.
6. **Open PR.** Reference the beads ID. Describe what changed and why, link the PRD.
7. **Close the issue.** `bd close <id>` after merge.

## Surgical changes

- Touch only files the slice requires.
- Match existing style. Run `vp fmt` and `vp lint`.
- Do not rename, refactor, or "clean up" outside the slice — file a separate issue.
- Delete dead code instead of leaving compat shims.

## When to escalate

Stop and write a comment on the PRD or the issue if you discover:

- The PRD is wrong or contradicted by the code.
- The slice is more than ~2x the estimated size.
- A blocking dependency that the kanban did not capture.

The right move is to update the PRD or split the issue, not to silently expand scope.

## Verification

Before requesting review:

- [ ] `vp check` passes
- [ ] `vp test` passes
- [ ] New behavior is covered by a test
- [ ] No unrelated changes in the diff
- [ ] PR description states the user-facing effect, not just the implementation

## Anti-patterns

- **Horizontal slicing.** Writing all tests first then all the code produces tests of imagined behaviour. Vertical only — see the [`tdd`](../../.claude/skills/tdd/SKILL.md) skill.
- **Mocking the seam you are testing.** Integration tests should hit real boundaries when feasible.
- **"Refactor while you are in there."** Costs review time and hides the actual change.
