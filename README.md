# Vite+ Monorepo Starter

Personal Vite+ monorepo. Hosts `apps/website` (oskarhulter.com) and shared `packages/` (`client`, `server`, `shared`, `utils`), all wired through the unified `vp` CLI.

Use this process for making changes in this project: [`docs/feature-dev-process/`](./docs/feature-dev-process/README.md).

## Development

- Check everything is ready:

```bash
vp run ready
```

- Run the tests:

```bash
vp run -r test
```

- Build the monorepo:

```bash
vp run -r build
```

- Run the development server:

```bash
vp run dev
```
