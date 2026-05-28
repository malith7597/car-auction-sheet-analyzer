---
name: forge-gap-check
phases: [engineering]
description: Use before fleshing out any feature spec body beyond the ## Context section. Scans inputs (matched PRD section, reference system inventory, meeting notes, architecture, prior approved specs) for ambiguities and writes them into the spec's ## Open Questions section as Blockers (B-N) and Warnings (W-N). Idempotent — re-runs read existing entries and skip resolved items. Advisory — surfaces gaps, never decides them, never blocks.
---

# forge-gap-check

Per-feature pre-spec sensor. Surface ambiguities in the inputs *before* the spec body is drafted. Output goes directly into the target feature spec's `## Open Questions` section as Blockers (`B-N`) and Warnings (`W-N`).

## When to use

- About to flesh out a feature spec body beyond `## Context`
- User says "let me spec out X" / "let's start the X spec"
- A stub spec exists at `.forge/specs/<feature>-spec.md` (created by Gate 3) and only `## Context` has content
- Re-run after resolving Blockers to confirm no new gaps surfaced

## When NOT to use

- Before Gate 3 has run (no stub specs to target yet)
- For PRD-level gaps — that's `forge-prd-author` territory
- After the spec is approved — revise the spec via the Spec Revision Convention instead (see `.claude/rules/specs.md`)

## Inputs read (in order)

1. The target spec itself (`.forge/specs/<feature>-spec.md`) — needed to find existing IDs and the matched PRD section
2. `.forge/project-prd.md` — find the matched feature in `## Functional Surface` (case-insensitive title match)
3. `.forge/discovery/feature-inventory.md` (if present) — replicate / redesign / defer / discard classification
4. `.forge/discovery/meeting-notes/*.md` — only files mentioning the feature title (case-insensitive substring match)
5. `.forge/design/architecture.md`
6. `.forge/features.md` — read this feature's `Blocked By` cell to know which other specs to read
7. Other approved specs the feature depends on (`status: approved` only)

## Procedure

### 1. Locate target

The target spec is either passed as an argument (`<feature>` or full path) or inferred from the file most recently being edited. If no target can be determined, stop and ask: *"Which feature spec should gap-check run against?"*

### 2. Validate target exists

Stop with this message if no stub spec is found at the expected path: *"No spec at `.forge/specs/<x>-spec.md`. Run `/forge-decompose` first to create stubs, or create the stub manually from `_TEMPLATE-spec.md`."*

### 3. Parse existing IDs

Read the target spec's `## Open Questions` section. Extract all bullets whose ID matches the regex `^[BW]-\d+$`. Record the highest existing `B-N` and `W-N`. New IDs continue from those values + 1.

If the section is missing, create it (it is required per `_TEMPLATE-spec.md`).

### 4. Read inputs and classify gaps

Walk the input list above. Classify findings as:

**Blockers (`B-N`)** — gaps that prevent meaningful spec authoring:

- Domain entity referenced in PRD but undefined in domain model
- Feature classified as "redesign" in `feature-inventory.md` but no behavioral target stated anywhere
- Contradictions between PRD and `architecture.md` for this feature
- Dependency on a spec that's still in draft or has unresolved Blockers of its own
- Required inputs are missing entirely (e.g., the PRD has no entry for this feature in `## Functional Surface`)

**Warnings (`W-N`)** — gaps that allow drafting but should resolve before the plan:

- PRD says "TBD" / "eventually" / "soon" for a bound relevant to this feature
- Non-functional requirements vague (no perf number, no error-handling stance)
- Multiple meeting notes have conflicting wording but no explicit decision was logged
- Missing `feature-inventory.md` classification when other features were classified

### 5. Append findings to the spec

Append new entries to the spec's `## Open Questions` section in this exact format:

```markdown
- **B-1** [YYYY-MM-DD, gap-check] Domain entity `Account` referenced in PRD §Functional Surface but not defined in §Domain Model. Resolve before spec body.
- **W-1** [YYYY-MM-DD, gap-check] PRD says "eventually" for batch-import; pin a phase before plan.
```

Each entry: ID (next unused `B-N` or `W-N`), ISO date, source tag `gap-check`, then a single sentence stating the gap and what closes it.

**Existing entries are never modified or deleted.** Resolution is human work — the user removes a bullet and folds the answer into the relevant spec section.

### 6. Print findings table to session

Show what was added without requiring the user to open the spec:

```
## forge-gap-check findings — <feature> — YYYY-MM-DD

| ID | Class | Gap |
|---|---|---|
| B-1 | new | Domain entity `Account` referenced... |
| W-1 | new | PRD says "eventually" for batch-import... |

2 new entries appended to .forge/specs/<feature>-spec.md `## Open Questions`.
No existing entries modified.
```

If no new gaps were found: print *"No new gaps. Existing: B-3, W-2, W-5."* and exit without writing.

### 7. Halt prompt (only if new Blockers found)

If any new Blockers were appended, prompt:

```
New Blockers found. Recommend resolving before fleshing out the spec body.
Continue anyway? [y/n]
```

If only Warnings were found, no prompt — let the user proceed.

## Idempotency

- IDs are append-only across runs. Numbering moves monotonically forward; resolved IDs are never reused.
- A re-run with no new gaps prints existing IDs and exits without writing.
- The skill never modifies or deletes existing `## Open Questions` entries — that is the user's job.

## What this skill deliberately doesn't do

- **No new files.** Honors the per-feature-no-new-files doctrine in `.claude/rules/tracker.md` "Gate Audit Protocol".
- **No Complexity Score.** Sizing is Gate 3's job; duplicating it here adds noise without signal.
- **No automatic resolution.** The skill surfaces gaps; humans decide.
- **No `tracker.yaml` writes.** This is an advisory primitive, not a gate.
- **No blocking hook.** Advisory by design — promotion to enforcement requires evidence of drift.

## Edge cases

| Case | Behavior |
|------|----------|
| Stub spec doesn't exist at expected path | Stop with: *"No spec at `.forge/specs/<x>-spec.md`. Run `/forge-decompose` first."* |
| `## Open Questions` section missing in spec | Create it; this would only happen if the template was deviated from |
| Feature title not found in PRD `## Functional Surface` | Surface a Warning (`W-N`): *"Feature title not found in PRD; gap analysis ran without PRD context."* |
| `feature-inventory.md` missing | Skip step 3 silently; this is a non-rebuild engagement |
| All discovery directories missing | Run with whatever inputs exist; surface a Warning if nothing was readable |
| Existing entries contain non-`B-/W-` bullets | Leave them alone; only IDs matching `^[BW]-\d+$` participate in the numbering counter |

## Related

- Spec template: `.forge/specs/_TEMPLATE-spec.md`
- Gate 3 (creates the stubs this skill operates on): `/forge-decompose`
- PRD authoring counterpart (engagement-level): `forge-prd-author`
