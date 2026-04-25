---
name: tdd
description: Test-driven development by tracer bullet — one test, one impl, repeat. Use when building features or fixing bugs test-first, or when red-green-refactor is requested.
---

> Adapted from [mattpocock/skills/tdd](https://github.com/mattpocock/skills/blob/main/tdd/SKILL.md). MIT.

Build behaviour one slice at a time. Each red-green-refactor cycle is a tracer bullet through the whole stack.

## What good tests look like

- Test **behaviour** through the public interface, not internals
- Read like a spec: "user can checkout with valid cart"
- Survive refactors — renaming an internal function should not break them
- Prefer integration-style coverage over unit mocks where the seam is real

## Vertical, not horizontal

Write tests and code in the same cycle, one behaviour at a time:

```
test1 → impl1 → test2 → impl2 → ...
```

Writing all tests first then all the code locks tests to imagined behaviour and to surface shape, so they pass when behaviour breaks and fail when it doesn't.

## Workflow

### 1. Plan

- Confirm the public interface with the user
- Confirm which behaviours matter most — you cannot test everything
- Look for chances to deepen modules
- Design the interface for testability
- List behaviours, not implementation steps
- Get user sign-off

### 2. Tracer bullet

```
RED:   write the test, watch it fail
GREEN: smallest code that makes it pass
```

### 3. Loop

For every remaining behaviour, repeat one cycle at a time. One test at a time. Only the code needed for the current test. No anticipating future tests.

### 4. Refactor

Only on green. Extract duplication. Deepen modules. Run tests after each step. Stop before writing speculative code.

## Per-cycle checklist

- [ ] Test names a behaviour, not a function
- [ ] Test goes through the public interface only
- [ ] Test would survive an internal refactor
- [ ] Code is the minimum for this test
- [ ] No speculative features
