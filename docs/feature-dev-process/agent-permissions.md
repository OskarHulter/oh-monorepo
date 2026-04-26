# Agent Permissions

Strict autonomous loop: see [`02-implementation.md`](./02-implementation.md#required-permissions).

## Assumed branch protection on `main`

Applied via **Settings → Rules → Rulesets**. Server enforces these so the local allowlist below stays broad.

- Block force-push (feature branches still allow `--force-with-lease`)
- Require PR before merge
- Linear history (squash or rebase merge; no merge commits)
- Code Owners review — enforced by [`.github/CODEOWNERS`](../../.github/CODEOWNERS)
- CI green — required check: `check` (job from `.github/workflows/ci.yml`)
- Branch up-to-date before merge
- Block deletion

## Posture

- Allow: read-only + reversible repo ops
- Allow: git/`gh` writes — server gates real damage
- Deny: repo escapes (`rm -rf` outside, `chmod -R`), bypasses (`--no-verify`, `--force` to main, `gh api -X DELETE`)
- Confirm: shared blast radius (releases, secrets, settings)

## Allow

### Vite+

- `vp install|check|test|lint|fmt`
- `vp build|pack|preview|run <script>`
- `vp dev` — long-running, use `run_in_background`
- `vp dlx <pkg>`, `vp exec <bin>`
- `vp add|remove|update|dedupe|outdated|list|why|info`

### Beads

- Read: `bd ready|list|show|search|stats|blocked|memories|doctor`
- Write: `bd create|update|close|reopen|dep add|note|remember|defer`

### Git

- Read: `git status|diff|log|show|blame|branch|remote -v|stash list`
- Write: `git add`, `git commit`, `git push origin <branch>`, `git push --force-with-lease origin <branch>`
- Branch: `git checkout|switch|branch <name>|merge --ff-only|rebase` (non-interactive), `git rebase --continue|--abort`
- Sync: `git fetch|pull --rebase|stash|stash pop|restore|cherry-pick`

### GitHub CLI

- PR read: `gh pr list|view|diff|status|checks`
- PR write: `gh pr create --allow-edits|edit|ready|comment|review|checkout`, `gh pr merge --squash|--rebase` (never `--merge`)
- Issues: `gh issue list|view|create|edit|comment|close|reopen`
- Repo/runs: `gh repo view`, `gh run list|view`, `gh workflow list|run|view`, `gh release list|view`
- API GET: `gh api repos/.../actions/runs`, `gh api repos/.../tags` (allow is broad-scoped to the repo; mutating methods `-X POST|PUT|PATCH|DELETE` and their `--method` aliases are explicitly denied)

### Filesystem

- `mkdir -p`, `cp`, `mv`
- `rimraf` — repo-relative paths only (`node_modules`, `dist`, `coverage`, `.turbo`, `.vp/`, `packages/*`, `apps/*`). Absolute (`rimraf /*`), home (`rimraf ~*`), and parent-relative (`rimraf ../*`) are denied.
  - **One argument only.** Matchers prefix-glob the full command line, so a safe first arg permits unsafe later args (`rimraf node_modules /tmp/foo` would match the allow). Repo rule (see AGENTS.md): single-arg rimraf only.
- `find`, `rg`, `grep`, `tree`, `wc`

### Misc

- `node --version`, `corepack enable`
- `gh auth status` (read), `gh auth login` (interactive — needs human)

## Deny

- `bd edit` — blocks agent on `$EDITOR`
- `git push origin main` — server rejects
- `git push --force` — use `--force-with-lease`
- `git push --no-verify`, `git commit --no-verify`
- `git rebase -i` — interactive blocks agent
- `git reset --hard origin/main|main`
- `git config --global *`
- `gh api -X POST|PUT|PATCH|DELETE *` (and `--method` aliases), `gh repo delete`, `gh secret set|delete`, `gh release create|delete|edit`, `gh workflow disable`
- `rm -rf /*`, `rm -rf ~*`, `rimraf /*`, `rimraf ~*`, `rimraf ../*`, `chmod -R *`, `sudo *`

## Permission file

- `.claude/settings.json` — hooks (gitignored under `.claude/*`)
- `.claude/settings.local.json` — per-machine permissions (gitignored)
- Matchers = prefix-globs; deny > allow
- `gh pr create --allow-edits` is the default — lets maintainers push to PR branch
