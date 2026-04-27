# Infrastructure docs

Living references for the platform decisions that shape `oh-monorepo`. Unlike ADRs (one-shot, immutable), these documents change as adoption stages move.

## Index

- [Cloudflare inventory + AWS↔CF mapping](cloudflare-inventory.md) — single source of truth for CF-native services + adoption gates (oh-monorepo-tfx).
- [Drizzle database targets per workload](drizzle-database-targets.md) — per-workload DB picks, decided as workloads ship (oh-monorepo-4dn; framed by ADR 0009).
