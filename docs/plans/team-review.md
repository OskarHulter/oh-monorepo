# Step 10 — Team Review

> **Skill:** none — process step, owned by humans. See [`.claude/skills/`](../../.claude/skills/README.md) for the skill set used in earlier steps.
> **Output:** shared understanding, captured decisions, handoff to operate/maintain.

## Why

Code review checks the diff. Human QA checks the experience. Team review is the only step that checks whether the feature *fits* — into the product, the architecture, the operational story, and the team's mental model. Without it, knowledge stays trapped in the author's head and shows up later as "why did we build it this way?" two quarters from now.

Team review also serves a forward-looking purpose: it is where the next round of ideas comes from. Demoing the finished work surfaces adjacent problems and follow-up bets that no individual reviewer would have spotted.

## When

After human QA passes and before (or immediately after) merge to `main`. Do not wait until release — by then the context has cooled.

## Who attends

- Author(s).
- At least one engineer outside the feature's slice.
- Product or design partner if the feature is user-facing.
- Anyone who will operate or be paged on the feature in production.

Keep it small. Six people max. Larger means async writeup instead.

## Format

Time-boxed to 30 minutes:

1. **Demo (10 min).** Author walks through the feature against the PRD's success criteria. No slides — use the actual product.
2. **Architecture pass (10 min).** Author shows the key seams: where new code lives, what it depends on, how it is tested, what it logs.
3. **Risks and followups (10 min).** Open discussion of known limits, debt, and adjacent work.

## What gets captured

A short writeup attached to the PRD folder as `team-review.md`:

- **Decisions made** (e.g., "we will not support X for now").
- **Followup issues filed** with `bd` IDs.
- **Operational notes** (dashboards, alerts, runbooks updated).
- **Open questions** with named owners.

If nothing was captured, the meeting did not happen — schedule it again.

## Outputs

- Team-review writeup checked in.
- New beads issues for followups, blocked on this feature where appropriate.
- Updated runbook / dashboard / on-call notes if production behavior changed.

## Anti-patterns

- **Demo without the PRD.** The demo must be measured against the destination, not the implementation.
- **Architecture review by the author alone.** The point is fresh eyes; if no one outside the slice attends, reschedule.
- **Decisions made verbally and not written down.** They will be relitigated in three months. Capture them.
