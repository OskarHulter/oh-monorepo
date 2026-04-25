# Architecture Decision Records

Index of Architecture Decision Records (ADRs) for `oh`. Oldest first, numbered in order.

Each ADR is a single file under [`adr/`](./adr). Start a new ADR by copying the template and incrementing the number.

- Format: [MADR](https://adr.github.io/madr/)

- 0001 · _Adopted_ · [Validate env schema](0001-validate-env-schema.md)
- 0002 · _Adopted_ · [Unify dev tooling](0002-unify-dev-tooling.md)
- 0003 · _Adopted_ · [Prevent version drift](0003-prevent-version-drift.md)
- 0004 · _Adopted_ · [Validate trust boundaries](0004-validate-trust-boundaries.md)
- 0005 · _Adopted_ · [Vitest e2e testing](0005-vitest-e2e-testing.md)
- 0006 · _Adopted_ · [CI risk mitigation](0006-ci-risk-mitigation.md)

## Template

```markdown
# NNNN. Title of load-bearing decision. Focus on why, not what.

- Status: Proposed | Adopted | Rejected | Superseded by [NNNN](NNNN-slug.md)
- Date: YYYY-MM-DD
- Deciders: @handle, @handle

## Context and Problem Statement

Two or three sentences on the forces at play and what needs to be decided. Phrase as a question if it sharpens things.

## Decision Drivers

- {constraint, quality attribute, or pressure that ruled the choice}
- {…}

## Considered Options

- {option A}
- {option B}
- {option C — including "do nothing" when relevant}

## Decision Outcome

Chosen option: **{option}**, because {one-line why — ties back to a decision driver}.

### Positive Consequences

- {what this unlocks}

### Negative Consequences

- {what this costs or locks us into}

## Pros and Cons of the Options

### {option A}

- Good, because {…}
- Bad, because {…}

### {option B}

- Good, because {…}
- Bad, because {…}
```
