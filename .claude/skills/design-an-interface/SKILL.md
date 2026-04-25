---
name: design-an-interface
description: Generate multiple radically different interface designs for a module using parallel sub-agents, then compare. Use when designing an API, exploring module shapes, or when "design it twice" applies.
---

> Adapted from [mattpocock/skills/design-an-interface](https://github.com/mattpocock/skills/blob/main/design-an-interface/SKILL.md). MIT.

From "Design It Twice" (Ousterhout): the first design is rarely the best. Generate radically different options, then compare.

## Workflow

### 1. Gather requirements

- What problem does this module solve?
- Who calls it? (modules, external users, tests)
- What are the key operations?
- Constraints? (perf, compatibility, existing patterns)
- What stays hidden vs. exposed?

### 2. Generate in parallel

Spawn 3+ subagents at once. Each gets a different constraint to force divergence:

- **A** — minimise method count (1–3)
- **B** — maximise flexibility, support many use cases
- **C** — optimise for the most common case
- **D** — copy a paradigm (iterator, visitor, builder, language X stdlib)

Each must output:

1. Interface signature — types, methods, params
2. Usage example — how a real caller writes it
3. What this design hides
4. Trade-offs

### 3. Present sequentially

One design at a time. Let the reader absorb each before the next.

### 4. Compare in prose

- Interface simplicity
- General-purpose vs. specialised
- Implementation efficiency
- Depth — small interface, big inside (good) vs. large thin interface (bad)
- Ease of correct use vs. ease of misuse

Highlight where designs diverge most.

### 5. Synthesise

Often the best answer is a hybrid. Ask which fits the primary use case, and which elements from other designs to lift in.
