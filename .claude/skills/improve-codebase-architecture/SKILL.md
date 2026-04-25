---
name: improve-codebase-architecture
description: Find deepening opportunities in a codebase — refactors that turn shallow modules into deep ones for testability and AI-navigability. Use when researching a feature or looking for refactor candidates.
---

> Adapted from [mattpocock/skills/improve-codebase-architecture](https://github.com/mattpocock/skills/blob/main/improve-codebase-architecture/SKILL.md). MIT.

Surface architectural friction. Propose refactors that hide more behaviour behind a smaller interface. Aim: testable seams and a codebase agents can navigate.

## Vocabulary (use exactly)

- **Module** — anything with an interface and an implementation
- **Interface** — everything a caller must know: types, invariants, error modes, ordering, config
- **Depth** — leverage at the interface; deep = lots of behaviour behind a small interface
- **Seam** — where an interface lives; where behaviour can change without editing in place
- **Adapter** — a concrete satisfier at a seam
- **Locality** — change, bugs, and knowledge concentrated in one place

Don't drift into "component / service / API / boundary." Name the seam.

## Key tests

- **Deletion test** — imagine deleting the module. Complexity vanishes → it was a pass-through. Complexity reappears across N callers → it was earning its keep.
- **The interface is the test surface** — if you cannot test through it, deepen the interface; do not extract a private function for testability.
- **One adapter = hypothetical seam. Two adapters = real seam.** Don't introduce seams without a second use.

## Process

1. **Read first** — open `CONTEXT.md` (if present) and ADRs in `docs/adr/`. Don't flag absence; just proceed.
2. **Explore** with the `Explore` subagent. Look for: bouncing across many small modules to grasp one concept, shallow modules, pure functions extracted only for testability while bugs live in callers, leaky seams, untested or hard-to-test paths.
3. **Apply the deletion test** to anything suspect.
4. **Present candidates** as a numbered list. For each: files involved, problem, plain-English solution, benefits in terms of locality, leverage, and tests.
5. **Use domain words** from `CONTEXT.md`, not file names. "The Order intake module," not "FooBarHandler."
6. **Mention ADR conflicts** only when worth reopening.
7. **Wait for the user to pick** before designing.

## On a picked candidate

Drop into a grilling conversation. Walk constraints, dependencies, the deepened module's shape, what sits behind the seam, what tests survive.

Inline side effects:

- New term introduced → add to `CONTEXT.md`
- Fuzzy term sharpened → update `CONTEXT.md`
- Candidate rejected with a load-bearing reason → offer to record an ADR
- Multiple plausible interfaces → use [`design-an-interface`](../design-an-interface/SKILL.md)
