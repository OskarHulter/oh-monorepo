---
name: to-prd
description: Synthesise the current conversation and codebase context into a PRD, then file it as a tracking issue. No interview — produce the artifact from what you already know.
---

> Adapted from [mattpocock/skills/to-prd](https://github.com/mattpocock/skills/blob/main/to-prd/SKILL.md). MIT.

Take what is already in the conversation plus what you can read in the repo, and produce a PRD. Do not interview the user — synthesis only.

## Process

1. **Explore** the repo if you have not already. Just enough to ground the PRD in current modules and naming.
2. **Sketch the modules** that will be built or modified. Look for chances to extract **deep modules** — small testable interfaces, big internals, low rate of change.
3. **Confirm the module sketch** with the user before writing the PRD. Also confirm which modules they want test coverage on.
4. **Write the PRD** using the template below.
5. **File it.** In this repo, create a beads issue: `bd create --type=feature --title="<feature>" --description="<full PRD body>"`. Pocock's upstream uses `gh issue create`; we use `bd`.

## PRD template

```markdown
## Problem statement

The user-facing problem, in their words. Not the internal motivation.

## Solution

What changes for the user when this ships. Not how it is built.

## User stories

A long, numbered list. Format:

1. As a <actor>, I want <feature>, so that <benefit>.

Cover every relevant flow — happy path, edge cases, error states, admin paths.

## Implementation decisions

- Modules to be built or modified.
- Interfaces of those modules — describe shape, not signature line-by-line.
- Architectural decisions made by the developer.
- Schema changes, API contracts, key interactions.

Do **not** include file paths or code snippets. They go stale faster than the PRD.

## Testing decisions

- What "good test" means here: external behaviour, not implementation details.
- Which modules will be tested.
- Prior art — similar test patterns already in the codebase.

## Out of scope

What this PRD explicitly does not cover, and why.

## Further notes

Loose ends, open questions, things to revisit.
```

## Anti-patterns

- Interviewing the user. This skill assumes context already exists.
- Writing implementation steps in the PRD. The PRD is the destination, not the route.
- File paths. They rot.
