# Step 6 — Implementation

> Output: code, tests, ADRs; one PR per kanban issue (or tight group).
> Skills: `prd-to-plan`, `superpowers:tdd`, `superpowers:executing-plans`

## Why

Implementation is the loop where the PRD meets reality. The goal is not "write the code" — it is to land each kanban slice with verifiable success criteria, so that review and QA have something concrete to check. Plan-driven, test-first execution keeps the loop honest: every change is justified by an issue, every issue is closed by a green test.

## The loop

For each ready issue:

1. **Claim it.** `bd update <id> --claim` and move to in-progress.
2. **Plan the slice.** Use `prd-to-plan` to break the issue into tracer-bullet steps. Record the plan in the issue or a short `plan.md` if it spans multiple files.
3. **Worktree it.** One worktree per slice, branched from `main`. Avoids cross-contamination during review.
4. **Red-green-refactor.** Use `superpowers:tdd`. Write the failing test first, make it pass with the minimum code, then refactor.
5. **Verify.** Run `vp check` and `vp test`. Do not declare done until both pass.
6. **ADR if non-obvious.** If a non-trivial design decision was made, add an ADR under `docs/adr/`.
7. **Open PR.** Reference the beads ID. Description states what changed and why, and links the PRD.
8. **Close the issue.** `bd close <id>` after merge.

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

- **Implementation without a plan.** Going straight from PRD to code skips the step where you discover the PRD is wrong.
- **Mocking the seam you are testing.** Integration tests should hit real boundaries when feasible.
- **"Refactor while you are in there."** Costs review time and hides the actual change.
