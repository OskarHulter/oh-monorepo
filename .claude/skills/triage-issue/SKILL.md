---
name: triage-issue
description: Triage a defect by exploring the codebase to find root cause, then file an issue with a TDD-based fix plan. Use after QA surfaces a defect, or when a bug is reported.
---

> Adapted from [mattpocock/skills/triage-issue](https://github.com/mattpocock/skills/blob/main/triage-issue/SKILL.md). MIT.

> **Mode:** agent-only chat (Ralph Loop, headless run, dispatched subagent) → `caveman full`. Human present → project default.

Investigate a reported problem, find its root cause, and file an issue with a red-green-refactor fix plan. Mostly hands-off — minimise questions to the user.

## Process

### 1. Capture the problem

Take whatever the user already gave. If nothing, ask exactly one question: "What's the problem you're seeing?" Then start working.

### 2. Explore and diagnose

Use the `Explore` subagent. Find:

- **Where** it manifests — entry points, UI, API responses.
- **What** code path is involved — trace the flow.
- **Why** it fails — the root cause, not the symptom.
- **What** related code exists — similar patterns, tests, adjacent modules.

Look at:

- Source files in the path and their dependencies.
- Existing tests — what is covered, what is missing.
- Recent commits on relevant files (`git log`).
- Error handling along the path.
- Similar patterns elsewhere that work correctly.

### 3. Pick the fix approach

Decide:

- The minimal change that addresses the root cause.
- Which modules and interfaces are affected.
- Which behaviours need test coverage.
- Whether this is a regression, a missing feature, or a design flaw.

### 4. Design the TDD plan

A concrete ordered list of red-green cycles. Each cycle is one vertical slice.

- **RED**: a specific test capturing the broken or missing behaviour.
- **GREEN**: the smallest change that makes it pass.

Rules:

- Tests verify behaviour through public interfaces, not internals.
- One test at a time. Vertical slicing.
- Tests must survive internal refactors.
- Add a final refactor step only if needed.
- Suggestions describe behaviours and contracts — they read like a spec, not a diff.

### 5. File the issue with `bd`

Do not ask the user to review the body first. File and share the ID.

```markdown
## Problem

<actual vs. expected, with repro steps if applicable>

## Root cause analysis

<what investigation found: code path involved, why it fails, contributing factors. No file paths or line numbers — describe modules, behaviours, contracts>

## TDD fix plan

1. **RED**: <test for first behaviour>
   **GREEN**: <minimal change>
2. **RED**: <next behaviour>
   **GREEN**: <minimal change>
   ...

**REFACTOR**: <cleanup after all tests green, or omit>

## Acceptance criteria

- [ ] <criterion>
- [ ] <criterion>
- [ ] All new tests pass
- [ ] Existing tests still pass
```

After filing, print the beads ID and a one-line summary of the root cause.
