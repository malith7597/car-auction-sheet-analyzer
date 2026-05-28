---
description: Tracker update rules, phase gates, end-of-session check, lessons-entry format, gate audit protocol. Loads when editing tracker.yaml, engagement-gate-runs.md, project-prd.md, or lessons.md.
globs: .forge/tracker.yaml, .forge/engagement-gate-runs.md, .forge/project-prd.md, .forge/lessons.md
---

# Tracker & Gate Audit Rules

`.forge/tracker.yaml` is the project status file. Leadership uses it for visibility.

## Update Rules

- Add new features/tasks to the tracker (even at backlog stage)
- Update artifact status when you create or update a spec/plan
- Update phase when work advances
- Update `blocked_by` when a blocker is identified or resolved
- Always update `last_updated` (ISO 8601 timestamp) when you touch the tracker
- Keep `notes` brief — one line, current state only, not a history log

## Phase Gates

- `spec` → spec artifact exists
- `plan` → spec approved
- `dev` → plan approved
- `review` → dev work complete
- `ship` → quality checks passed
- Skipping a gate is the developer's call — but ask and note in tracker
- `paused` and `dropped` are exit states — record reason in `notes`

## Delivery Phase Rules

`delivery.phases` groups features into stakeholder-facing milestones. Each feature carries `delivery_phase: <int>` referencing a phase `id`. Phases are layered on top of the dependency graph — `blocked_by` still drives sequencing within a phase; phases drive the stakeholder narrative.

**Phase status vocabulary** (four values, distinct intents):

- `planning` — being shaped *right now*. Used during the Gate 3 proposal step while phases are still being defined; rarely seen post-Gate-3 except during an explicit replan.
- `in-progress` — currently active. Exactly one phase at a time. This is the phase whose features the team is presently developing and shipping.
- `complete` — sealed. Every feature in this phase is `done` or `dropped`, the developer has confirmed the seal, and `sealed: <ISO date>` is set.
- `locked` — defined but not opened yet. The phase has a title and theme and feature assignments, but development on its features has not started. After Gate 3 lands, every phase except the first is `locked`.

**Invariants (enforced by ASK rather than by hook):**

- At most one phase has `status: in-progress` at any time.
- `delivery.current_phase` equals the `id` of the `in-progress` phase, or `null` if no phase is active.
- A phase with `status: in-progress` must have `started: <ISO date>` set; phases in `planning` or `locked` keep `started: null`.
- A phase with `status: complete` must have `sealed: <ISO date>` set; phases in any other status must have `sealed: null`. `started` is preserved on `complete` (it records when work began).
- A feature's `delivery_phase` may reference any phase id (including `locked` or `complete`) or be `null`. Specing and planning a feature ahead of its phase is allowed; advancing it to `dev` while its phase is `locked` is an ASK FIRST action — surface the override and record it in `notes`.
- Renaming a phase title is safe (features reference `id`, not title). Reassigning a feature to a different phase is safe but should be noted in the feature's `notes`.

**Status transitions and what to update:**

- **Defining phases (Gate 3, full mode):** `/forge-decompose` populates `delivery.phases` and assigns each feature a `delivery_phase`. The first phase flips to `in-progress` with `started: <today>`; all others stay `locked` with `started: null`. `current_phase` is set.
- **Sealing a phase:** when every feature in a phase is `done` (or `dropped`), ask the developer to confirm the phase is sealable. On confirmation: flip the phase to `complete`, set `sealed: <today>` (preserve `started`), flip the next phase to `in-progress` and set its `started: <today>`, and update `current_phase`. Do not auto-seal — the developer's verdict is required.
- **Opening a phase ahead of schedule:** ASK FIRST — describe what's still open in the current phase and confirm before flipping statuses. Set `started: <today>` on the phase being opened.
- **Adding a feature post-Gate-3:** new feature gets `delivery_phase: <id>` (or `null`); confirm placement with the developer.
- **Splitting/dropping a feature:** preserve the `delivery_phase` on the split children unless the developer says otherwise; for dropped features, leave `delivery_phase` in place for record.

**Optional for small projects.** If the engagement has fewer than ~10 features and the team doesn't want a phased narrative, leave `delivery.phases: []` and `current_phase: null`. Every feature's `delivery_phase` stays `null`. The dashboard hides the delivery view in that case.

## Lessons Entry Format

`.forge/lessons.md` holds engagement-level lessons learned, queued for upstream sync to `forge-harness`. The dashboard's **Lessons cadence** signal counts entries per week, so the heading format must be parseable:

- Each lesson is an `h3` heading: `### YYYY-MM-DD — <short title>`.
- Newest entry on top.
- Body below the heading is free-form prose; the date in the heading is what the signal parser reads.

Example:

```
### 2026-05-19 — Always run harness-change-reviewer before pushing
We pushed three commits in a row that each had small CHANGELOG omissions...

### 2026-05-12 — Don't mix project-specific content into the meta-repo
Discovered during the first /forge-spec-review run that the template's...
```

If a lesson predates this convention, leave it alone — the parser ignores headings that don't match the format, which is the correct outcome (those entries aren't counted in cadence).

## End-of-Session Check

Wrapping up tracked work and developer hasn't stated status → ask: *"Before we wrap up — should I update the tracker? [Current item] is at [current status]."*

## Harness Version Sync

`tracker.yaml` carries `harness_version` — it pins the last upstream `forge-harness` version whose template/CHANGELOG content has been synced into this project.

- Whenever upstream changelog entries are ported into this harness, bump `harness_version` to the highest synced version in the same change.
- Source of truth for available versions: `forge-harness/CHANGELOG.yaml` (top entry = latest).
- Always refresh `last_updated` alongside the bump.
- If a partial sync is intentional, do not bump — record the partial scope in `notes` and leave the pin at the last fully-synced version.

## Gate Audit Protocol

The pre-implementation gates (`/forge-prd-check`, `/forge-arch-probe`, `/forge-decompose`) need persistent audit because the artifacts they verify (PRD, architecture, backlog) don't have built-in `## Revisions` sections like specs do.

**Audit storage matches artifact scope:**

- **Engagement-level gates** → audit file at `.forge/engagement-gate-runs.md`. Plus snapshot in `.forge/project-prd.md` `## Gate Status` table and structured state in `.forge/tracker.yaml` under `setup.*`.
- **Per-feature gates** (spec/plan review, adversarial review, security review) → reuse spec body + `## Revisions`, plan `## Notes` + `## Progress`. No new files.
- **Tool-call-level gates** (hooks, lint, typecheck) → ephemeral. Stderr only. No persistent audit.

**When engagement-level commands run in full mode**, three writes happen atomically:

1. Append `## Gate N Run M` block to `.forge/engagement-gate-runs.md`.
2. Update Gate N row in `.forge/project-prd.md` `## Gate Status` table.
3. Update `.forge/tracker.yaml` `setup.<gate>` (status, last_gate_run, accepted_risks, spikes for Gate 2).

**Skip all three writes in `dry-run` mode** — print findings only.

**Never assume gate outcome.** Ask the developer for the verdict (pass / pass-with-risks / pass-with-spikes / fail) before writing. Ask for id, owner, and reasoning of each accepted risk or scoped spike.
