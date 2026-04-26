# Agent Permissions

- Default human-in-the-loop allowlist
- Server boundary: [`branch-protection.md`](./branch-protection.md)
- Strict autonomous loop: [`docs/plans/implementation.md`](../plans/implementation.md#required-permissions)

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
- API GET: `gh api repos/.../actions/runs`, `gh api repos/.../tags`

### Filesystem

- `mkdir -p`, `cp`, `mv`, `rimraf <repo-path>`
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
- `gh api -X DELETE *`, `gh repo delete`, `gh secret set|delete`, `gh release create|delete|edit`, `gh workflow disable`
- `rm -rf /*`, `rm -rf ~*`, `chmod -R *`, `sudo *`

## `--allow-edits`

- Default for agent PRs
- Lets maintainers push to PR branch
- Meaningful on fork PRs; harmless on same-repo

## Permission file

- `.claude/settings.json` — hooks (gitignored under `.claude/*`)
- `.claude/settings.local.json` — per-machine permissions (gitignored)
- Matchers = prefix-globs; deny > allow

```jsonc
{
  "permissions": {
    "allow": [
      "Bash(vp *)",
      "Bash(bd *)",
      "Bash(git push origin *)",
      "Bash(git push --force-with-lease origin *)",
      "Bash(gh pr *)",
      "Bash(gh issue *)",
      "Bash(gh run *)",
      "Bash(gh api repos/OskarHulter/*)",
      "Bash(rimraf *)",
    ],
    "deny": [
      "Bash(git push origin main*)",
      "Bash(git push --force *)",
      "Bash(git push --no-verify *)",
      "Bash(git rebase -i *)",
      "Bash(gh api -X DELETE *)",
      "Bash(gh release create *)",
    ],
  },
}
```

## Why broad is OK

- Server blocks main writes + force-push (see [`branch-protection.md`](./branch-protection.md))
- Local denylist gates only: repo escapes, agent blockers, server-irreversible ops
- Everything else reversible via `git revert` / `gh pr close` / `bd reopen`
