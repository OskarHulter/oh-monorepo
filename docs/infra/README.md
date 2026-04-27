# Infrastructure docs

Living references for the platform decisions that shape `oh-monorepo`. Unlike ADRs (one-shot, immutable), these documents change as adoption stages move.

## Index

- [Cloudflare inventory + AWS↔CF mapping](cloudflare-inventory.md) — single source of truth for CF-native services + adoption gates (oh-monorepo-tfx).
- [Drizzle database targets per workload](drizzle-database-targets.md) — per-workload DB picks, decided as workloads ship (oh-monorepo-4dn; framed by ADR 0009).
- [Chart libraries — per-surface matrix](chart-libraries.md) — per-surface picks; principle ratified in [ADR 0011](../adr/0011-per-surface-chart-libraries.md) (oh-monorepo-b4c).
- [Animation + shader stack](animation-stack.md) — tiered animation/shader stack with perf budgets and spike status (oh-monorepo-cgt; ratified by ADR 0010).
- [Secrets adoption plan — Infisical via varlock](secrets-adoption-plan.md) — per-env matrix + init flow + workflows for the source layer beneath ADR 0001 (oh-monorepo-6is, ADR 0012).
