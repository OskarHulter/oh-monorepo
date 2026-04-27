# 0008. Security scanning baseline (Dependabot + CodeQL, defer Trivy/Socket.dev/OSV)

- Status: Adopted
- Date: 2026-04-27
- Deciders: @oskarhulter

## Context and Problem Statement

Every PR should be scanned for dependency vulnerabilities, supply-chain risk, and SAST findings without manual gates. Snyk free is a possible consolidated dashboard — does its weight pay off vs. composing GitHub-native plus a few lightweight OSS tools?

## Decision Drivers

- Coverage: dependency CVEs, SAST, supply-chain, IaC, container — at least the first two from day one
- Cost: zero recurring spend; no API tokens needed for the baseline
- Latency: fits inside the existing CI window without parallel workflow sprawl
- Read path: results visible in the GitHub Security tab, not a third-party UI we forget to open
- Reversibility: easy to add Snyk later if the day-one stack underperforms

## Considered Options

- **A. GitHub-native first** (Dependabot + CodeQL), add Trivy / OSV-Scanner / Socket.dev as discrete follow-ups when their value is clear
- **B. Snyk free tier from the start** as the consolidated dashboard
- **C. Big-bang OSS stack** (Dependabot + CodeQL + Trivy + OSV-Scanner + Socket.dev) shipped together
- **D. Defer scanning until a vuln bites us**

## Decision Outcome

Chosen option: **A — GitHub-native first**. Ship CodeQL (`security-extended,security-and-quality`) and extend Dependabot to npm in this slice. File follow-up tickets for Trivy (filesystem + IaC), OSV-Scanner, and Socket.dev so each lands with its own decision instead of as a single chunk no one reviews.

### Positive Consequences

- Findings flow into the Security tab — same surface as Dependabot alerts, no extra dashboard.
- Zero accounts, zero tokens, zero recurring spend for the baseline.
- Each follow-up tool gets its own PR + review, matching how we landed CI risk mitigation (ADR 0006).
- Snyk stays a fallback. If the consolidated view becomes worth more than the weight, we adopt it knowing exactly what it would replace.

### Negative Consequences

- No supply-chain risk-scoring on PRs until Socket.dev follow-up lands — risky deps slip in if reviewers aren't paying attention.
- No IaC / container scanning yet (no Dockerfiles in the repo right now, so the gap is small but real once IaC arrives — see oh-monorepo-fhi).
- CodeQL `security-extended` adds noise; we'll triage rather than suppress until a pattern emerges.

## Pros and Cons of the Options

### A. GitHub-native first

- Good, native integration; Security tab is the read path we already use for Dependabot
- Good, ship-in-an-afternoon scope; further tools land deliberately
- Bad, supply-chain visibility is delayed until Socket.dev follow-up

### B. Snyk free

- Good, single dashboard for SCA + SAST + IaC
- Bad, free tier is ~200 private-repo SCA tests/month — easy to exhaust on a monorepo
- Bad, IDE plugin + CLI add weight; replaces the GH-native read path

### C. Big-bang OSS stack

- Good, full coverage on day one
- Bad, no per-tool review; the workflow file becomes a junk drawer
- Bad, Socket.dev / Trivy each have their own onboarding (token, image catalog) — bundling buries the cost

### D. Defer

- Good, zero work
- Bad, the cost of a missed CVE is paid in incidents, not engineering hours

## Implementation Notes

- `.github/workflows/codeql.yml`: PR + weekly cron, `security-events: write`, `persist-credentials: false`, SHA-pinned action with `# vX.Y.Z` comment per ADR 0006.
- `.github/dependabot.yml`: npm ecosystem added at repo root (workspaces auto-detected). `vite-plus` + `@voidzero-dev/*` ignored — bumps come via `vp upgrade`. React majors ignored — deliberate.
- Follow-ups (one ticket each):
  - Trivy filesystem + IaC scan (revisit when IaC ships per oh-monorepo-fhi)
  - OSV-Scanner cross-ecosystem check
  - Socket.dev PR risk comments
  - License-compatibility tooling + SBOM cadence (the open questions on oh-monorepo-lgb)
