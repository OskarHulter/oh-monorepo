# Step 8 — Human QA of Completed Work

> **Skill:** [`qa`](../../.claude/skills/qa/SKILL.md)
> **Output:** executed test plan, defect log, sign-off or rejection. Defects feed step 9 ([`triage-issue`](../../.claude/skills/triage-issue/SKILL.md)).

## Why

Tests verify the code is *correct*. Human QA verifies the feature is *right* — that the destination in the PRD has actually been reached. Skipping it is the most common cause of "shipped but broken."

## Who runs it

- Not the author
- Ideally a teammate who has read the PRD but not the diff
- For user-facing changes, include someone who matches the target persona

## Inputs

- Feature deployed to a preview environment
- The PRD
- A written test plan from the author covering golden path, edge cases, known risks

## Test plan template

```markdown
## Golden path
- [ ] <step-by-step user flow that should succeed>

## Edge cases
- [ ] <empty state, max input, slow network, etc.>

## Regression
- [ ] <related features that could break>

## Cross-cutting
- [ ] Accessibility (keyboard, screen reader)
- [ ] Mobile/responsive
- [ ] Auth/permission boundaries
```

## How to run it

1. Read the PRD before opening the PR
2. Work through the test plan in a real runtime — not screenshots
3. Log every defect immediately: title, repro steps, severity
4. Decide: **pass**, **pass with followups**, or **reject**

## Severity

- **P0** — blocks the feature or breaks something else. Fix before merge.
- **P1** — user-visible defect on the golden path. Fix before merge.
- **P2** — edge case or polish. File issue, may ship.
- **P3** — nice-to-have. File issue, ship.

## Outputs

- Pass/fail decision attached to the PR
- Beads issues for P2/P3 findings — file via [`qa`](../../.claude/skills/qa/SKILL.md), root-cause the deeper ones with [`triage-issue`](../../.claude/skills/triage-issue/SKILL.md)
- The executed test plan checked into the PRD folder as `qa.md`
