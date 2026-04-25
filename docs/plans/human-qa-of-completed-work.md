# Step 8 — Human QA of Completed Work

> Output: executed test plan, defect log, sign-off or rejection.

## Why

Type checks, unit tests, and code review verify that the code is *correct*. They do not verify that the feature is *right*. Human QA is the only step that closes that gap — a person uses the feature the way a user would and decides whether the destination described in the PRD has actually been reached.

Skipping this step is the most common cause of "shipped but broken" features.

## Who does it

- **Not the author.** Authors have blind spots; that is the entire point.
- Ideally a teammate who has read the PRD but not the diff.
- For user-facing changes, include someone who matches the target persona where possible.

## Inputs

- The merged or staged feature, deployed to a preview environment.
- The PRD (so QA knows the destination).
- A written test plan from the author covering golden path, edge cases, and known risks.

## Test plan template

```markdown
## Golden path
- [ ] <step-by-step user flow that should succeed>

## Edge cases
- [ ] <empty state, max input, slow network, etc.>

## Regression
- [ ] <related features that could break>

## Cross-cutting
- [ ] Accessibility (keyboard nav, screen reader where applicable)
- [ ] Mobile/responsive
- [ ] Auth/permission boundaries
```

## How to run it

1. Reviewer reads the PRD first, not the PR.
2. Reviewer works through the test plan in a real browser/runtime, not via screenshots.
3. Every defect gets logged immediately — title, repro steps, severity.
4. Reviewer decides: **pass**, **pass with followups**, or **reject**.

## Severity guide

- **P0** — blocks the feature or breaks something else. Fix before merge.
- **P1** — user-visible defect on the golden path. Fix before merge.
- **P2** — edge case or polish. File issue, may ship.
- **P3** — nice-to-have. File issue, ship.

## Outputs

- Pass/fail decision attached to the PR.
- A list of beads issues for any P2/P3 findings (see Step 9).
- The test plan itself, checked into the PRD folder as `qa.md`, so the next reviewer sees what was already covered.

## Anti-patterns

- **Author runs their own QA.** Replace with a teammate.
- **"Looks good" sign-off.** Not a QA result. Require the test plan to be visibly executed.
- **Silent fixes after QA.** Any change after QA must be re-checked, not assumed safe.
