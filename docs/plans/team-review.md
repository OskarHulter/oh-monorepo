# Step 10 — Team Review

> **Skill:** none — process step, owned by humans. See [`.claude/skills/`](../../.claude/skills/README.md) for skills used in earlier steps.
> **Output:** shared understanding, captured decisions, handoff to operate/maintain.

## Why

Code review checks the diff. Human QA checks the experience. Team review checks the *fit* — into the product, the architecture, the operational story, and the team's mental model. It is also where the next round of ideas surfaces, since demoing finished work exposes adjacent problems.

## When

After human QA passes and before — or immediately after — merge to `main`. Don't wait for release; the context will have cooled.

## Who attends

- Author(s)
- At least one engineer outside the slice
- Product or design partner if user-facing
- Anyone who will operate or be paged on this in production

Cap at six. Larger means async writeup instead.

## Format (30 minutes)

1. **Demo (10 min).** Walk the feature against the PRD's success criteria. Use the actual product, not slides.
2. **Architecture pass (10 min).** Show the key seams: where new code lives, what it depends on, how it is tested, what it logs.
3. **Risks and followups (10 min).** Open discussion of known limits, debt, adjacent work.

## What gets captured

A `team-review.md` in the PRD folder containing:

- **Decisions made** (e.g. "we will not support X for now")
- **Followup beads issues** with IDs
- **Operational notes** — dashboards, alerts, runbooks updated
- **Open questions** with named owners

If nothing was captured, the meeting did not happen — schedule it again.
