---
description: Feature spec lifecycle — revision convention, status transitions, rework triggers. Loads when editing files under .forge/specs/.
globs: .forge/specs/**
---

# Spec Lifecycle Rules

Section schema lives in `.forge/specs/_TEMPLATE-spec.md`. These are the *rules* for working with specs.

## Status Transitions

- New spec → `Status: draft` in both file and tracker
- Never assume approval. Only mark `approved` when the developer explicitly confirms
- "Looks good" or "that's fine" → confirm before marking approved: *"Should I mark this as approved in the tracker?"*
- Approval requires a `Reviewed-via: /forge-spec-review` annotation in the header (feature specs only; foundation specs exempt) — the `guard-spec-approval` hook enforces this at write time

## Revision Convention

Approved specs are contracts. When a spec changes after approval:

1. Add a revision entry at the bottom under `## Revisions`
2. Update the affected requirements and acceptance criteria in the spec body
3. Note the impact on the plan if one exists

```markdown
## Revisions

### Rev 1 — YYYY-MM-DD
- **Changed:** [what changed]
- **Why:** [reason discovered]
- **Impact on plan:** [subtask or approach affected]
- **Approved by:** [name]
```

**Revision required:** any change to requirements, acceptance criteria, or scope after approval.
**No revision needed:** typos, clarifying detail that doesn't change a requirement, open question updates.

## Rework Triggers (spec is wrong mid-implementation)

- Do not silently adjust an approved spec — follow the Revision Convention above
- If the change invalidates the current plan, pause implementation and revise the plan first
- Reference-system behavior misunderstood → spec revision
- Entirely new feature discovered → add to project PRD for decomposition; do not fold into the current ticket

## Pre-Spec Gap Check

Before fleshing out any feature spec body beyond `## Context`, run the `forge-gap-check` skill against the spec. Resolve Blockers (`B-N`) before drafting requirements; Warnings (`W-N`) can be resolved during drafting or before the plan.

<!--
Why this rule exists: gaps surfaced at spec-authoring time are cheap to resolve;
gaps discovered mid-implementation cost a spec revision and rework.
-->

## Findings Capture

Tactical findings discovered during/after feature work go in `.forge/specs/<feature>-findings.md` (use `_TEMPLATE-findings.md`). One entry per coherent finding, ID format `F-NNN`, append-only. Promote generalizable findings to `.forge/lessons.md` during Reflect with a `Promoted: L-NNN` back-reference; scoped findings stay where they are with `Promoted: scoped`.
