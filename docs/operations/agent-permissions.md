# Agent Permissions — General Allowlist

Default permission posture for agents working in this repo. Pairs with [`branch-protection.md`](./branch-protection.md): the server enforces what matters (`main` cannot be force-pushed, every change needs a Code Owners-approved PR, CI must be green), so the local allowlist can be broad without being dangerous.

For the **strict autonomous loop** that ships unsupervised work, see [`docs/plans/implementation.md`](../plans/implementation.md#required-permissions). That keeps a tighter denylist because nobody is reviewing each step in real time.

## Posture

- **Allow by default** for read-only and reversible commands inside the repo.
- **Allow** for git/`gh` write operations, because [`branch-protection.md`](./branch-protection.md) makes them safe at the server.
- **Deny** for destructive shell ops (`rm -rf` outside the repo, `chmod`-the-world, etc.) and anything that bypasses the server (`git push --no-verify`, `--force` to `main`, `gh api -X DELETE`).
- **Confirm before** running commands with shared blast radius even if technically allowed (publishing releases, rotating secrets, modifying `Settings/`).

## Safe to allowlist

### Vite+ (`vp`)

- `vp install` (`vp i`), `vp check`, `vp test`, `vp lint`, `vp fmt`
- `vp build`, `vp pack`, `vp preview`, `vp run <script>`
- `vp dev` (long-running — use `run_in_background`)
- `vp dlx <pkg>`, `vp exec <bin>`
- `vp add`, `vp remove` (`vp rm`/`un`/`uninstall`), `vp update` (`vp up`), `vp dedupe`, `vp outdated`, `vp list` (`vp ls`), `vp why`, `vp info`

### Beads (`bd`)

- Read: `bd ready`, `bd list`, `bd show`, `bd search`, `bd stats`, `bd blocked`, `bd memories`, `bd doctor`
- Write: `bd create`, `bd update`, `bd close`, `bd reopen`, `bd dep add`, `bd note`, `bd remember`, `bd defer`
- Sync: `bd backup sync`, `bd backup status` — see [`beads-backup.md`](./beads-backup.md)
- **Avoid**: `bd edit` (opens `$EDITOR`, blocks the agent)

### Git

- Read: `git status`, `git diff`, `git log`, `git show`, `git blame`, `git branch`, `git remote -v`, `git stash list`
- Write: `git add`, `git commit`, `git push origin <feature-branch>`, `git push --force-with-lease origin <feature-branch>`
- Branching: `git checkout`, `git switch`, `git branch <name>`, `git merge --ff-only`, `git rebase` (non-interactive), `git rebase --continue`, `git rebase --abort`
- Sync: `git fetch`, `git pull --rebase`, `git stash`, `git stash pop`, `git restore`, `git cherry-pick`
- **Deny**: `git push origin main` (server rejects anyway), `git push --force` (use `--force-with-lease`), `git rebase -i` (interactive blocks the agent), `git reset --hard origin/main` on `main`, `git push --no-verify`, `git config --global *`

### GitHub CLI (`gh`)

- PR read: `gh pr list`, `gh pr view`, `gh pr diff`, `gh pr status`, `gh pr checks`
- PR write: `gh pr create --allow-edits` (default to `--allow-edits` so maintainers can fix the branch), `gh pr edit`, `gh pr ready`, `gh pr comment`, `gh pr review`, `gh pr checkout`, `gh pr merge --squash` (or `--rebase`; never `--merge` — violates linear history)
- Issues: `gh issue list/view/create/edit/comment/close/reopen`
- Repo / runs: `gh repo view`, `gh run list/view`, `gh workflow list/run/view`, `gh release list/view`
- API GET: `gh api repos/.../actions/runs`, `gh api repos/.../tags`, etc.
- **Deny / confirm**: `gh release create/delete/edit`, `gh api -X DELETE`, `gh repo delete`, `gh secret set/delete`, `gh workflow disable`

### Filesystem

- `mkdir -p`, `cp`, `mv`, `rimraf <repo-relative-path>`
- `find`, `rg`, `grep`, `tree`, `wc`
- **Deny**: `rm -rf` outside the repo, `chmod -R` on system paths

### Misc

- `node --version`, `corepack enable`
- `gh auth status` (read), `gh auth login` (interactive — needs human)

## `--allow-edits` on agent-authored PRs

`gh pr create --allow-edits` flips the **"Allow edits by maintainers"** checkbox on. Default it on for every agent-authored PR — lets you fix typos / rebase / push small adjustments without checking out the branch. Only meaningful for fork PRs in practice; harmless on same-repo PRs.

## Permission file shape

The repo's `.claude/settings.json` carries hooks. Per-machine permissions belong in `.claude/settings.local.json` (gitignored). Example skeleton:

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
      "Bash(git push origin main)",
      "Bash(git push --force *)",
      "Bash(git push --no-verify *)",
      "Bash(git rebase -i *)",
      "Bash(gh api -X DELETE *)",
      "Bash(gh release create *)",
    ],
  },
}
```

The pattern matchers are prefix-globs; `Bash(git push --force *)` blocks any invocation starting with `git push --force` (including `--force` without `-with-lease`). `--force-with-lease` is allowed because it has a separate matcher.

## Why broad is OK here

Without [`branch-protection.md`](./branch-protection.md) the broad allowlist would be reckless — an agent could `git push --force origin main` and erase history. With the Ruleset applied, that command fails server-side. The local allowlist therefore only needs to gate against:

- Mistakes that escape the repo (broad `rm -rf`, system `chmod`)
- Commands that block the agent (interactive editors, `gh auth login`)
- Operations the server can't undo (deleting releases, rotating secrets)

Everything else is reversible via `git revert`, `gh pr close`, or `bd reopen`.
