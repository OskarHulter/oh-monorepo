---
name: tdd
description: Test-driven development by tracer bullet — one test, one impl, repeat. Use when building features or fixing bugs test-first, or when red-green-refactor is requested.
---

> Adapted from [mattpocock/skills/tdd](https://github.com/mattpocock/skills/blob/main/tdd/SKILL.md). MIT.

Build behaviour one slice at a time. Each red-green-refactor cycle is a **tracer bullet** through the whole stack.

## What good tests look like

- Test **behaviour** through the public interface, not internal collaborators.
- Read like a spec: "user can checkout with valid cart."
- Survive refactors. If renaming an internal function breaks a test, that test was testing implementation.
- Prefer integration-style coverage over unit mocks where the seam is real.

## Anti-pattern: horizontal slicing

Do **not** write all tests up front and then all the code. That produces:

- Tests of imagined behaviour, not actual behaviour.
- Tests that lock in a shape (signatures, data structures) instead of meaning.
- Tests that pass when behaviour breaks and fail when behaviour is fine.

The right shape is vertical:

```
WRONG (horizontal): test1, test2, test3 → impl1, impl2, impl3
RIGHT (vertical):   test1 → impl1 → test2 → impl2 → ...
```

Each test responds to what the previous cycle just taught you.

## Workflow

### 1. Plan

Before any code:

- [ ] Confirm the public interface with the user.
- [ ] Confirm which behaviours matter most. You cannot test everything.
- [ ] Look for chances to deepen modules — small interface, big inside.
- [ ] Design the interface for testability.
- [ ] List behaviours, not implementation steps.
- [ ] Get user sign-off on the plan.

### 2. Tracer bullet

One test that proves end-to-end:

```
RED:   write the test, watch it fail.
GREEN: smallest code that makes it pass.
```

### 3. Loop

For every remaining behaviour, repeat one cycle at a time. Rules:

- One test at a time.
- Only the code needed for the current test.
- Do not anticipate future tests.
- Tests stay focused on observable behaviour.

### 4. Refactor

After all tests are green:

- [ ] Extract duplication.
- [ ] Deepen modules — move complexity behind simple interfaces.
- [ ] Run tests after each refactor step.
- [ ] Stop refactoring before you start writing speculative code.

Never refactor while red. Get to green first.

## Per-cycle checklist

- [ ] Test names a behaviour, not a function.
- [ ] Test goes through the public interface only.
- [ ] Test would survive an internal refactor.
- [ ] Code is the minimum for this test.
- [ ] No speculative features.
