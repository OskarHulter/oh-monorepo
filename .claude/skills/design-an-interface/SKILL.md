---
name: design-an-interface
description: Generate multiple radically different interface designs for a module using parallel sub-agents, then compare. Use when designing an API, exploring module shapes, or when "design it twice" applies.
---

> Adapted from [mattpocock/skills/design-an-interface](https://github.com/mattpocock/skills/blob/main/design-an-interface/SKILL.md). MIT.

From "Design It Twice" (Ousterhout): the first design is rarely the best. Generate radically different options, then compare.

## Workflow

### 1. Gather requirements

Ask the user, briefly:

- What problem does this module solve?
- Who calls it? (other modules, external users, tests)
- What are the key operations?
- Constraints? (perf, compatibility, existing patterns)
- What stays hidden vs. exposed?

### 2. Generate designs in parallel

Spawn 3+ subagents at once. Each gets a different constraint to force divergence:

- Agent A: minimise method count (1–3 methods).
- Agent B: maximise flexibility, support many use cases.
- Agent C: optimise for the most common case.
- Agent D: copy a paradigm (e.g. iterator, visitor, builder, the standard library of a language X).

Each must output:

1. Interface signature — types, methods, params.
2. Usage example — how a real caller writes it.
3. What this design hides internally.
4. Trade-offs.

### 3. Present sequentially

One design at a time. Let the reader absorb each before showing the next.

### 4. Compare in prose

Discuss them on:

- Interface simplicity (fewer methods, simpler params).
- General-purpose vs. specialised — flexibility vs. focus.
- Implementation efficiency — does the shape allow efficient internals?
- Depth — small interface hiding significant complexity (good) vs. large thin interface (bad).
- Ease of correct use vs. ease of misuse.

Highlight where designs diverge most. Skip tables; prose surfaces the trade-offs better.

### 5. Synthesise

Often the best answer is a hybrid. Ask:

- Which design fits the primary use case?
- Any element from another design worth lifting in?

## Anti-patterns

- Subagents producing similar designs — enforce divergence by assigning different constraints.
- Skipping comparison — the value is in the contrast, not the count.
- Implementing during this skill — it is purely about interface shape.
- Picking on implementation effort — pick on shape.
