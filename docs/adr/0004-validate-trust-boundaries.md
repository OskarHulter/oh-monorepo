# 0004. Validate trust boundaries

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

TypeScript types vanish at `tsc`. Data crossing trust boundaries — config files, env, API payloads — arrives as `unknown` in practice, yet code assumes the declared shape. When it's wrong, failures surface layers deep from the violation.

## Decision Drivers

- Validate at the boundary, not at the call site
- One shape per domain concept, reused across every package
- Types and runtime validator derived from the same source
- Minimal learning curve for contributors

## Considered Options

- Types only (no runtime validation)
- `io-ts`
- `yup`
- `ArkType`
- `zod`

## Decision Outcome

Chosen option: **zod**, defined in `@oh/shared/schemas/*`. Each schema exports both the runtime validator and `z.infer<typeof>` for types; consumers call `.parse()` at every boundary.

### Positive Consequences

- Invalid data fails at the boundary with a clear error, not three stack frames deep
- Duplicate type definitions impossible — schema is the source
- Zod composes with varlock env handling (ADR 0001) — same mental model

### Negative Consequences

- Runtime parse cost (negligible for config-sized payloads)
- Bound to zod's API churn — e.g. v4 deprecations like `z.string().url()` → `z.url()`

## Pros and Cons of the Options

### Types only

- Good, because zero runtime cost
- Bad, because boundaries are unchecked — bugs land in prod

### io-ts

- Good, because algebraic types, rigorous
- Bad, because steep learning curve, functional-combinator style

### yup / ArkType

- Good, because viable alternatives
- Bad, because smaller ecosystem overlap with our current dep graph

### zod

- Good, because ubiquitous, great TS inference, `z.infer` pattern is well-known
- Bad, because API sometimes changes across majors
