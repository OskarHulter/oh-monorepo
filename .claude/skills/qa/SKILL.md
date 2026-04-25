---
name: qa
description: Interactive QA session — user reports problems conversationally, agent files durable issues using domain language. Use during human QA of completed work.
---

> Adapted from [mattpocock/skills/qa](https://github.com/mattpocock/skills/blob/main/qa/SKILL.md). MIT.

Run an interactive QA session. The user describes what they hit; you clarify briefly, learn the relevant area in the background, and file durable issues that survive future refactors.

## For each problem the user raises

### 1. Listen, lightly clarify

Let them describe it in their own words. Ask **at most 2–3 short clarifying questions**:

- Expected vs. actual.
- Repro steps if not obvious.
- Consistent or intermittent.

If the description is filable, stop asking.

### 2. Background-explore the codebase

Kick off an `Explore` subagent in parallel with the conversation. Goal is **not** to find a fix — it is to:

- Pick up the domain language used in that area (`UBIQUITOUS_LANGUAGE.md` or `CONTEXT.md` if present).
- Understand what the feature is meant to do.
- Find the user-facing behaviour boundary.

That context shapes the issue. The issue itself stays free of file paths and internal details.

### 3. Single issue or breakdown?

**Break down** when:

- The problem spans independent areas anyone could grab in parallel.
- There are clearly separable failure modes.

**Keep it single** when:

- One behaviour is wrong in one place.
- All symptoms trace to one root cause.

### 4. File issues with `bd`

Do not ask the user to review first — file and share IDs.

Single issue body:

```markdown
## What happened

<actual behaviour, plain language>

## What I expected

<expected behaviour>

## Steps to reproduce

1. <concrete numbered steps in domain terms, no module names>
2. ...
3. ...

## Additional context

<observations from the user or background exploration, in domain language; no file paths>
```

For a breakdown, use the same body per sub-issue plus:

```markdown
## Parent

beads-<id> (or "Reported during QA session" if no tracking issue exists).

## Blocked by

- beads-<id>  (or "None — can start immediately")
```

Create blockers first so dependents can reference real IDs. Use `bd dep add` to wire blocking relationships.

### 5. Rules for every issue

- **No file paths or line numbers** — they rot.
- **Use domain language** the project already uses.
- **Describe behaviour, not code** — "the sync service drops the patch," not "applyPatch() throws on line 42."
- **Repro steps are mandatory.** If you cannot determine them, ask.
- **30-second read.** A developer should be able to understand it that fast.

### 6. Continue

Print all created IDs with their blocking relationships, then ask: "Next issue, or done?"
