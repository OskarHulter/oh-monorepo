# Step 10 — Team Review

> **Skill:** none — process step, owned by humans. See [`.claude/skills/`](../../.claude/skills/README.md) for skills used in earlier steps.
> **Output:** shared understanding, captured decisions, handoff to operate/maintain.

## Why

Team review checks *fit* — product, architecture, ops, mental model — and surfaces the next round of ideas.

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
