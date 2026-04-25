---
name: to-issues
description: Break a PRD or plan into independently-grabbable issues using tracer-bullet vertical slices. Use when converting a plan into kanban-ready tickets.
---

> Adapted from [mattpocock/skills/to-issues](https://github.com/mattpocock/skills/blob/main/to-issues/SKILL.md). MIT.

Convert a plan or PRD into issues that any human or agent can pick up independently. Each issue is a **tracer bullet** — a thin vertical slice that cuts through every layer end-to-end.

## Process

### 1. Gather context

Use what is in the conversation. If the user passes a beads ID, run `bd show <id>` to load the PRD.

### 2. Explore the codebase if needed

Just enough to know which layers exist (schema, API, UI, tests) so each slice can cut through them.

### 3. Draft vertical slices

Rules:

- Each slice cuts through **every** layer it touches.
- A completed slice is demoable or verifiable on its own.
- Prefer many thin slices over few thick ones.
- Mark each slice **AFK** (agent can finish without human input) or **HITL** (needs an architectural call or design review). Prefer AFK.

### 4. Quiz the user

Show a numbered list. Per slice:

- **Title** — short and descriptive.
- **Type** — AFK / HITL.
- **Blocked by** — which slices must merge first.
- **User stories covered** — link back to the PRD's stories where applicable.

Ask:

- Granularity right? Too coarse, too fine?
- Dependencies correct?
- Anything to merge or split?
- AFK/HITL labels honest?

Iterate until the user signs off.

### 5. File the issues

Use beads, in dependency order so blockers exist before dependents reference them:

```bash
bd create --type=task --priority=2 \
  --title="<slice title>" \
  --description="<body from template>"
bd dep add <dependent-id> <blocker-id>
```

## Issue body template

```markdown
## Parent

beads-<parent-id> (the PRD), or omit if no tracked parent.

## What to build

End-to-end behaviour delivered by this slice. Not a layer-by-layer breakdown.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- beads-<id> (or "None — can start immediately")
```

Do not modify or close the parent issue.
