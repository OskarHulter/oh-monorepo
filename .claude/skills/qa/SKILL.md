---
name: qa
description: Interactive QA session — user reports problems conversationally, agent files durable issues using domain language. Use during human QA of completed work.
---

> Adapted from [mattpocock/skills/qa](https://github.com/mattpocock/skills/blob/main/qa/SKILL.md). MIT.

> **Mode:** agent-only chat (Ralph Loop, headless run, dispatched subagent) → `caveman full`. Human present → project default.

Run an interactive QA session. The user describes what they hit; you clarify briefly, learn the area in the background, and file durable issues that survive future refactors.

## Per problem

### 1. Listen, lightly clarify

At most 2–3 short questions:

- Expected vs. actual
- Repro steps if not obvious
- Consistent or intermittent

If the description is filable, stop asking.

### 2. Background-explore

Kick off an `Explore` subagent in parallel. Goal is **not** to find a fix — it is to:

- Pick up the domain language used in that area (`UBIQUITOUS_LANGUAGE.md`, `CONTEXT.md`)
- Understand what the feature is meant to do
- Find the user-facing behaviour boundary

Use that context in the issue. Keep the issue itself free of file paths.

### 3. Single issue or breakdown?

- **Break down** when the problem spans independent areas, or has separable failure modes
- **Keep single** when one behaviour is wrong in one place

### 4. File with `bd`

Don't ask the user to review first — file and share IDs.

```markdown
## What happened

<actual behaviour, plain language>

## What I expected

<expected behaviour>

## Steps to reproduce

1. <concrete numbered steps in domain terms>
2. ...

## Additional context

<observations from user or background exploration; domain language; no file paths>
```

For breakdowns, add per sub-issue:

```markdown
## Parent

beads-<id> (or "Reported during QA session")

## Blocked by

- beads-<id> (or "None — can start immediately")
```

Create blockers first; wire dependencies with `bd dep add`.

### 5. Rules for every issue

- No file paths or line numbers
- Use the project's domain language
- Describe behaviour, not code
- Repro steps mandatory — ask if you can't determine them
- 30-second read

### 6. Continue

Print all created IDs with their blocking relationships, then ask: "Next issue, or done?"
