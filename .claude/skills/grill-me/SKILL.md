---
name: grill-me
description: Relentlessly interview the user about a plan or design until every branch of the decision tree is resolved. Use when user wants to stress-test a plan, get grilled on a design, or mentions "grill me".
---

> Adapted from [mattpocock/skills/grill-me](https://github.com/mattpocock/skills/blob/main/grill-me/SKILL.md). MIT.

Interview the user about every aspect of the plan until you both share the same picture. Walk the decision tree branch by branch.

## Rules

- **One question at a time.** Wait for the answer before the next.
- **Always offer your recommended answer.** Force the user to react, not invent.
- **Resolve dependencies in order.** Decisions that gate other decisions get asked first.
- **Explore before asking.** If the codebase can answer the question, read the code instead of bothering the user.
- **Stop when there are no unresolved branches**, not when you run out of questions.

## Output

A short writeup of the resolved decisions, attached to the PRD or research doc, so the next step (PRD → kanban → implementation) inherits the answers.
