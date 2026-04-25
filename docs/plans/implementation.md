# Step 6 — Implementation

> **Skill:** [`tdd`](../../.claude/skills/tdd/SKILL.md)
> **Output:** code, tests, ADRs; one PR per kanban issue (or tight group).

## Why

The nightshift. The dayshift artifacts (research, PRD, kanban) exist so this step can run with minimal supervision: every change is justified by an issue, every issue closed by a green test, every slice merged independently.

## The loop (per issue)

1. **Claim it** — `bd update <id> --claim`
2. **Worktree it** — one worktree per slice, branched from `main`
3. **Run [`tdd`](../../.claude/skills/tdd/SKILL.md)** — plan behaviours, then loop tracer bullets: red, green, repeat. Refactor only on green.
4. **Verify** — `vp check` and `vp test` must pass before declaring done
5. **ADR if non-obvious** — record significant design decisions under `docs/adr/`
6. **Open PR** referencing the beads ID; description states user-facing effect
7. **Close** with `bd close <id>` after merge

## Surgical changes

- Touch only files this slice requires
- Match existing style; run `vp fmt` and `vp lint`
- No drive-by refactors — file a separate issue
- Delete dead code instead of leaving compat shims

## When to escalate

Stop and update the PRD or split the issue if you discover:

- The PRD is contradicted by the code
- The slice is more than ~2x its estimated size
- A blocking dependency the kanban missed

## Verification checklist

- [ ] `vp check` passes
- [ ] `vp test` passes
- [ ] New behaviour covered by a test
- [ ] No unrelated changes in the diff
- [ ] PR description states the user-facing effect

## Implementor — the Ralph Loop

Pattern for running the nightshift across many ready issues without re-typing context. Two flavours share one shape; they differ in who picks the next task.

- **`once.sh`** — human in the loop. One issue per run; you review the PR before the next.
- **`afk.sh`** — autonomous. Picks the next ready issue and runs unattended.

Each run feeds Claude the same three things: the standing prompt, recent commit history (for continuity), and the issues to work.

```bash
# once.sh — human in the loop
issues=$(cat issues/*.md)                                  # ready beads, exported
commits=$(git log -5 --date=short --format='%h %ad %s')
prompt=$(cat ralph/prompt.md)                              # standing instruction

claude --permission-mode acceptEdits \
  "$prompt" \
  "previous commits:" "$commits" \
  "issues:" "$issues"

# afk.sh — same shape, plus: pick the next ready issue and re-run
```

`--permission-mode acceptEdits` is load-bearing. Without it, the loop stalls on every Edit/Write prompt and the nightshift turns back into a dayshift. Pair it with project-scoped permission allowlists (`Edit(<repo>/**)`, `Write(<repo>/**)`) and a deny list for destructive commands (`Bash(rm *)`, force-push) so the agent has the rope it needs and not a meter more.

Use `once.sh` while the prompt and acceptance criteria are still being tuned. Move to `afk.sh` once a full cycle (claim → red → green → PR → close) runs cleanly twice in a row without hand-holding. The `ralph-loop` plugin (`/ralph-loop`) is one ready-made executor for this shape.
