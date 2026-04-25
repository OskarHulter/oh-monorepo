---
name: to-prd
description: Synthesise the current conversation and codebase context into a PRD, then file it as a tracking issue. No interview — produce the artifact from what you already know.
---

> Adapted from [mattpocock/skills/to-prd](https://github.com/mattpocock/skills/blob/main/to-prd/SKILL.md). MIT.

Take what is already in the conversation plus what you can read in the repo, and produce a PRD. Synthesis only — no fresh interview.

## Process

1. **Explore** the repo if you haven't already. Just enough to ground the PRD in current modules and naming.
2. **Sketch the modules** to be built or modified. Look for chances to extract deep modules — small testable interface, big internals, low rate of change.
3. **Confirm** the module sketch and which need test coverage with the user before writing the PRD.
4. **Write the PRD** using the template below.
5. **File it** with `bd create --type=feature --title="<feature>" --description="<full PRD body>"`.

## PRD template

```markdown
## Problem statement

The user-facing problem, in their words.

## Solution

What changes for the user when this ships.

## User stories

A long, numbered list. Format:

1. As a <actor>, I want <feature>, so that <benefit>.

Cover happy path, edge cases, error states, admin paths.

## Implementation decisions

- Modules to build or modify
- Their interface shapes
- Architectural decisions
- Schema changes, API contracts, key interactions

No file paths or code snippets — they go stale faster than the PRD.

## Testing decisions

- What "good test" means here: external behaviour, not implementation
- Which modules will be tested
- Prior art — similar test patterns already in the codebase

## Out of scope

What this PRD does not cover, and why.

## Further notes

Loose ends, open questions.
```
