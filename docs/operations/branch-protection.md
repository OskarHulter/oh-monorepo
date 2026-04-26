# Branch Protection — `main`

Rules that make the agent-driven feature dev workflow safe. Pairs with [`agent-permissions.md`](./agent-permissions.md): the agent gets a broad allowlist for `git push`/`gh pr *` because the server enforces the actual safety boundary.

## Required rules

- **Block force pushes** — no rewriting `main`. Agents may force-push their own feature branches with `--force-with-lease`, never `main`.
- **Require pull request before merging** — every change lands via PR. Direct push to `main` denied.
- **Require linear history** — squash or rebase merge only. No merge commits. Keeps `git log main` readable.
- **Require review from Code Owners** — needs [`.github/CODEOWNERS`](../../.github/CODEOWNERS) to enforce. Owner: `@OskarHulter` for everything by default.
- **Require status checks to pass** — at minimum: the existing CI job from `.github/workflows/ci.yml`. Add release/security workflows as they stabilise.
- **Require branches to be up to date before merging** — forces `git pull --rebase origin/main` before merge; catches drift early.
- **Block deletions** — `main` cannot be deleted accidentally.

## Optional but recommended

- **Require signed commits** — only if you have GPG/SSH signing set up; otherwise this blocks every PR.
- **Restrict who can push** — limit to `@OskarHulter` plus any agents with their own GitHub identity.
- **Require conversation resolution before merging** — forces explicit "resolve" on review threads.

## Code Owners

GitHub auto-assigns the repo creator as admin, but the **"require review from Code Owners"** rule needs a `CODEOWNERS` file in `.github/`, `docs/`, or repo root to have anything to enforce. Without that file the rule passes vacuously and grants no protection.

Current rule: `* @OskarHulter` — everything requires owner review. Refine when collaborators join (e.g. `apps/website/** @frontend-team`).

## Apply via `gh` (GitHub Rulesets)

GitHub recommends Rulesets over classic branch protection. Save the JSON below and apply once:

```bash
cat > /tmp/main-ruleset.json <<'JSON'
{
  "name": "main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "require_code_owner_review": true,
        "dismiss_stale_reviews_on_push": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "ci" }
        ]
      }
    }
  ],
  "bypass_actors": []
}
JSON

gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/OskarHulter/oh-monorepo/rulesets \
  --input /tmp/main-ruleset.json
```

Verify in the web UI: **Settings → Rules → Rulesets**.

## Agent implications

With these rules in place, the agent allowlist in [`agent-permissions.md`](./agent-permissions.md) can be broad without being dangerous:

- `git push origin <feature-branch>` — fine, branch isn't `main`.
- `git push --force-with-lease origin <feature-branch>` — fine.
- `git push origin main` — server rejects.
- `gh pr merge` — only succeeds when CODEOWNERS approval + CI green + linear history.
- `gh pr create --allow-edits` — safe; maintainer (you) can still force-push the PR branch if needed.
