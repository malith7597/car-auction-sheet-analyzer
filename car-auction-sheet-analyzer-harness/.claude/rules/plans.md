---
description: Plan lifecycle — progress updates, failed approaches, rework triggers, status transitions. Loads when editing files under .forge/plans/.
globs: .forge/plans/**
---

# Plan Lifecycle Rules

Section schema lives in `.forge/plans/_TEMPLATE-plan.md`. These are the *rules* for working with plans.

## Status Transitions

- New plan → `Status: draft` in both file and tracker
- Never assume approval. Only mark `approved` when the developer explicitly confirms
- Approval requires a `Reviewed-via: /forge-plan-review` annotation in the header — the `guard-plan-approval` hook enforces this at write time (foundation and feature plans both gated)

## Progress Discipline

- Update the plan's `## Progress` section before ending any implementation session
- Record failed approaches in `## Failed Approaches` — what was tried and why it didn't work. Prevents the next session from repeating dead ends
- Follow patterns referenced in the plan — if the plan says "follow UserService", follow it

## Rework Triggers

- **Check fails** → fix in the same worktree and re-run. Record the fix in `## Progress`. Normal development loop.
- **Review rejects implementation** → record feedback in `## Notes` (what was wrong, what needs to change). Fix and resubmit. If the fix needs a different approach, update the plan with the new approach and note what changed and why.
- **Spec changed mid-implementation** → if the change invalidates the current plan, pause implementation and revise the plan first.

## Deviation

Deviating from the approved plan's approach is an **ASK FIRST** action — surface it before coding, not after.
