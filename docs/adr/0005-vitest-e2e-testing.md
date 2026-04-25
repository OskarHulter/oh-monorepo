# 0005. Vitest e2e testing

- Status: Adopted
- Date: 2026-04-25
- Deciders: @oskarhulter

## Context and Problem Statement

`apps/website` has DOM side-effects in `main.ts` (title, lang, meta tags). jsdom approximates these poorly, and spinning up a standalone Playwright project duplicates runners, reporters, and CI steps for what is effectively one module's integration test.

## Decision Drivers

- Real browser semantics where DOM behaviour matters
- One test pipeline for the whole workspace
- No duplicate config or reporters
- Reuse vp's bundled test infrastructure

## Considered Options

- jsdom in Vitest (single test runner, imprecise DOM)
- Standalone `@playwright/test`
- Cypress
- Vitest browser mode with the Playwright provider (bundled by `vite-plus/test/browser-playwright`)

## Decision Outcome

Chosen option: **Vitest browser mode (Playwright)**, because it's already bundled by `vite-plus/test`, runs through the same `vp test` pipeline as unit tests, and executes assertions in a real Chromium.

### Positive Consequences

- One test runner, one reporter, one config shape across unit and browser tests
- DOM assertions match production behaviour
- Browser provider factory is exported from `vite-plus/test/browser-playwright` — no extra vitest install

### Negative Consequences

- CI must install a browser binary (`playwright install chromium`)
- Per-test startup overhead (~1s) for the provider

## Pros and Cons of the Options

### jsdom

- Good, because fast and in-process
- Bad, because DOM APIs are approximations — tests lie about what the browser does

### Standalone Playwright Test

- Good, because industry standard for e2e
- Bad, because second runner, second config, second CI step; parallel reporting

### Cypress

- Good, because strong dev experience
- Bad, because heavy install, different assertion idiom, overkill for a single app

### Vitest browser mode

- Good, because same pipeline, real browser, bundled
- Bad, because still young — some configs (e.g. `provider: 'playwright'` string form) were removed between versions
