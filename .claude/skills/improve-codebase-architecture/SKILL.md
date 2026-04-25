---
name: improve-codebase-architecture
description: Find deepening opportunities in a codebase — refactors that turn shallow modules into deep ones for testability and AI-navigability. Use when researching a feature or looking for refactor candidates.
---

> Adapted from [mattpocock/skills/improve-codebase-architecture](https://github.com/mattpocock/skills/blob/main/improve-codebase-architecture/SKILL.md). MIT.

Surface architectural friction and propose **deepening opportunities** — refactors that hide more behaviour behind a smaller interface. Aim: testable seams and a codebase agents can navigate.

## Vocabulary (use exactly)

- **Module** — anything with an interface and an implementation (function, class, package, slice).
- **Interface** — everything a caller must know: types, invariants, error modes, ordering, config. Not just the type signature.
- **Implementation** — code inside.
- **Depth** — leverage at the interface. Deep = a lot of behaviour behind a small interface. Shallow = interface as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be altered without editing in place.
- **Adapter** — a concrete satisfier at a seam.
- **Locality** — change, bugs, and knowledge concentrated in one place.

Do not drift into "component / service / API / boundary" — name the seam.

## Key tests

- **Deletion test.** Imagine deleting the module. If complexity vanishes → it was a pass-through. If complexity reappears across N callers → it was earning its keep.
- **The interface is the test surface.** If you cannot test through it, deepen the interface, do not extract a private function for testability.
- **One adapter = hypothetical seam. Two adapters = real seam.** Do not introduce seams that have no second use.

## Process

1. **Read first.** Open `CONTEXT.md` (if present) and any ADRs in `docs/adr/`. Don't flag absence; just proceed.
2. **Explore.** Use the `Explore` subagent. Note friction:
   - Understanding one concept requires bouncing across many small modules.
   - Modules are shallow.
   - Pure functions extracted only for testability while real bugs live in their callers.
   - Tightly-coupled modules leaking across seams.
   - Untested or hard-to-test paths.
3. **Apply the deletion test** to anything suspect.
4. **Present candidates** as a numbered list. For each: files involved, problem, plain-English solution, benefits framed in locality and leverage and test improvement.
5. **Use domain words from `CONTEXT.md`, not file names.** "The Order intake module," not "FooBarHandler."
6. **Mention ADR conflicts only when worth reopening.** Never list every theoretical refactor an ADR forbids.
7. **Wait for the user to pick** a candidate before designing.

## When the user picks one

Drop into a grilling conversation. Walk the design tree: constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects, inline:
- New term being introduced → add it to `CONTEXT.md`.
- Fuzzy term sharpened → update `CONTEXT.md` immediately.
- Candidate rejected with a load-bearing reason future reviewers would need → offer to record an ADR.
- Multiple plausible interfaces → use [`design-an-interface`](../design-an-interface/SKILL.md).
