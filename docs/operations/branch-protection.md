# Branch Protection — `main`

Server enforces real safety boundary so [`agent-permissions.md`](./agent-permissions.md) allowlist stays broad. Applied via **Settings → Rules → Rulesets**.

## Rules on `main`

- **Block force-push.** No history rewrite. Feature branches still allow `--force-with-lease`.
- **Require PR before merge.** No direct push.
- **Linear history.** Squash or rebase merge only. No merge commits.
- **Code Owners review.** Needs [`.github/CODEOWNERS`](../../.github/CODEOWNERS) — without it rule passes empty.
- **CI green.** Status check context = `check` (job name from `.github/workflows/ci.yml`). Re-add when more required checks ship.
- **Branch up-to-date before merge.** Catches drift.
- **Block deletion.**

## Optional

- **Signed commits** — only with GPG/SSH set up, else blocks every PR.
- **Conversation resolution required** — force "resolve" on threads.

## Reproduce via `gh api`

Reference only; ruleset already applied via UI.

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
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [{ "context": "check" }]
      }
    }
  ]
}
JSON

gh api --method POST -H "Accept: application/vnd.github+json" \
  /repos/OskarHulter/oh-monorepo/rulesets --input /tmp/main-ruleset.json
```

## Agent implications

- `git push origin <branch>` → ✓
- `git push --force-with-lease origin <branch>` → ✓
- `git push origin main` → ✗ server rejects
- `gh pr merge --squash` → ✓ only after Code Owners approve + CI green
- `gh pr create --allow-edits` → ✓ maintainer can push to PR branch
