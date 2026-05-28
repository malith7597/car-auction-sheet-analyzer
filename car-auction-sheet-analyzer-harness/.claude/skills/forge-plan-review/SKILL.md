---
name: forge-plan-review
phases: [foundation, engineering]
description: Multi-pass automated review of a draft Forge plan with fix cycles. Reads plan + spec + harness context, invokes the `plan-reviewer` sub-agent for each pass (Pass 1 audits; Pass 2 verifies fixes), applies Blocker/Important fixes between passes, converges to no-issues-or-nits-only (max 2 passes), then asks the human for final approval. On approval, flips status to `approved` + updates tracker. Use whenever a plan is at `Status: draft` or `in-review` and the user asks to review, self-review, or approve it. Plans only — for spec review, use `/forge-spec-review`.
---

# /forge-plan-review

Automated multi-pass plan review with fix cycles. Replaces the manual review-fix-review-fix-review loop, enforcing structural independence on review (sub-agent runs in fresh context per pass) while keeping the human in the loop for final approval.

## How to Use

```
/forge-plan-review <plan-path>
```

`<plan-path>` is the path to the plan file relative to the harness root, e.g. `.forge/plans/foundation/003-be-data-layer-plan.md`.

If invoked without an argument, print usage and exit.

## When to Use

- A plan has just been drafted and is at `Status: draft`.
- A plan is at `Status: in-review` (mid-cycle) and needs to continue.
- The user says "review the F-XXX plan", "self-review the plan", "let's check plan X", "is this plan ready to approve?", or otherwise points at a plan and asks for review.

If the user wants spec review (not plan review), suggest `/forge-spec-review` — this skill is plan-only.

## Process

### 1. Validate inputs

```bash
PLAN_PATH="<plan-path>"      # as passed by the user
[ -f "$PLAN_PATH" ] || {
  echo "Plan not found: $PLAN_PATH"
  exit 1
}

STATUS=$(grep -m1 '^> Status:' "$PLAN_PATH" | sed 's/.*Status: //; s/[[:space:]]*$//')
case "$STATUS" in
  approved)
    echo "Plan is already at Status: approved. Re-running review on an approved plan is a no-op. Aborting."
    exit 0
    ;;
  draft|in-review)
    : # continue
    ;;
  *)
    echo "Plan status '$STATUS' is unrecognized (expected: draft | in-review). Aborting."
    exit 1
    ;;
esac
```

### 2. Resolve context

Parse the plan header for the spec reference. The `> Spec:` line points at the spec path relative to the harness root.

```bash
SPEC_REL=$(grep -m1 '^> Spec:' "$PLAN_PATH" | sed 's/.*Spec: //; s/`//g; s/[[:space:]]*$//')
SPEC_PATH="$(realpath "$SPEC_REL")"
[ -f "$SPEC_PATH" ] || {
  echo "Spec referenced in plan header not found: $SPEC_REL. Plan header may be malformed."
  exit 1
}
```

Identify relevant repo CLAUDE.md paths by grepping the plan body for repo CLAUDE.md references (e.g. `<backend-repo>/.claude/CLAUDE.md`, `<frontend-repo>/.claude/CLAUDE.md`). Substitute with the engagement's actual workspace paths. Resolve to absolute paths.

Capture the lead's name from `git config user.name` for use later when filling the `Reviewed by:` line.

### 3. Run review cycle

Maintain:
- `pass_counter` (starts at 1)
- `all_findings[]` — append each pass's findings for the final report
- `applied_fixes[]` — track what was changed each pass, to feed forward as `previous_findings` in the next pass

Loop:

#### a. Invoke the `plan-reviewer` sub-agent via the Task tool

Dispatch prompt template:

```
Review this Forge plan. Inputs:

- plan_path: <abs PLAN_PATH>
- spec_path: <abs SPEC_PATH>
- repo_claudemd_paths: <comma-separated abs paths>
- pass_number: <pass_counter>
- previous_findings: <on pass ≥ 2 only — short summary of prior-pass findings + what fixes were applied>

Read the files. Audit per the dimensions in your sub-agent definition. Produce the Verdict + Findings table.
```

Wait for the sub-agent's response. Parse:
- The verdict line (`pass` | `pass-with-nits` | `fail-with-issues`)
- The Blockers, Important, Nits tables

Append to `all_findings[]`.

#### b. Convergence check

- **Verdict `pass` or `pass-with-nits`** → exit loop. Proceed to step 4.
- **`pass_counter ≥ 2` AND verdict `fail-with-issues`** → exit loop with verdict `manual-rewrite-needed`. Pass 1 audited, fixes were applied, Pass 2 verified — and issues still remain. Tell the human the plan likely needs structural rewrite, not further patches. Skip the auto-approval step (4.5); skill exits.
- **Verdict `fail-with-issues`** (and `pass_counter < 2`) → apply fixes (next sub-step), increment `pass_counter`, loop back.

#### c. Apply fixes

For each Blocker and Important finding, apply the suggested fix using Edit (or MultiEdit when multiple edits are clustered).

Be judicious — the sub-agent's "Suggested fix" is directional:
- If the suggestion is a wording change ("change X to Y"), apply directly.
- If the suggestion is "rewrite the rationale to mention X", craft the rewrite with judgment. The sub-agent doesn't see the conversation history; you (main session) have full context — use it.
- If two suggestions conflict (rare but possible), prefer the more conservative; document in `applied_fixes[]`.

**Skip Nits.** They're surfaced for human review at convergence.

After applying fixes, record `applied_fixes[pass_counter] = "Fixed B1, B2, I1, I3"` (or similar). Increment `pass_counter`. Loop back to (a).

### 4. Convergence reporting

Once the loop exits with `pass` or `pass-with-nits`, present the summary to the user. Format:

```markdown
## Plan review converged after <N> pass(es)

| Pass | Blockers | Important | Nits | Action |
|---|---|---|---|---|
| 1 | 3 | 6 | 4 | Fixed B1–B3, I1–I6 |
| 2 | 1 | 2 | 3 | Fixed B1, I1–I2 |
| 3 | 0 | 0 | 2 | Converged |

## Remaining nits (your call at approval)

| # | Where | Issue | Suggested fix |
|---|---|---|---|
| N1 | … | … | … |
| N2 | … | … | … |
```

If zero nits remain, omit the Remaining nits table — say "No remaining nits."

### 4.5. Ask the human for approval

Present three options. **Never auto-approve.**

```
What would you like to do?

1. **Approve as-is** — flip status to `approved`. Nits left unaddressed.
2. **Apply nits then approve** — fix the listed nits, then flip status. (Skip if no nits.)
3. **Reject** — keep at Status: draft. Skill exits without changes; you can revise manually or re-run later.
```

**Rendering rule when zero nits remain:** omit option 2 from the prompt and renumber Reject as option 2 — present only two options. The "Apply nits then approve" path has nothing to do.

Wait for the human to pick.

### 5. On approval (option 1 or 2)

#### a. Apply remaining nits if option 2

For each Nit, apply the suggested fix via Edit.

#### b. Flip plan header (atomic — single Edit with annotation + status)

Use Edit to replace the existing header block with the approved version, **including the `Reviewed-via:` annotation in the same edit**. The `guard-plan-approval.sh` PreToolUse hook gates the `Status: approved` transition: it requires the `Reviewed-via: /forge-plan-review` line to be present in either the new edit content or the existing file. Bundling annotation + status flip into ONE Edit is the canonical idempotent path:

```markdown
> Status: approved
> Reviewed by: <lead-name> (lead)
> Date: <drafted-date> (drafted) · <today> (approved after <N>-pass review)
> Reviewed-via: /forge-plan-review (<N>-pass, <today>)
```

Where:
- `<lead-name>` = `git config user.name`
- `<drafted-date>` = preserve from existing header (parse the existing Date line — usually `YYYY-MM-DD` only)
- `<today>` = current date in `YYYY-MM-DD` form
- `<N>` = pass count

**Without the `Reviewed-via:` line, `guard-plan-approval.sh` will block the Edit and the skill will fail at this step.** The line is the evidence the hook checks for. The skill writes it; manual approvals trying to skip the cycle don't have it and get blocked.

#### c. Update tracker

Open `.forge/tracker.yaml`. Locate the entry whose `plan` field matches the plan path. **Two locations to check** — the skill is plan-type-agnostic:

| Plan type | Tracker location | Status enum |
|---|---|---|
| Foundation plan (`.forge/plans/foundation/<id>-plan.md`) | `setup.foundation.slices[]` | `not-started \| spec \| plan \| dev \| review \| done` |
| Feature plan (`.forge/plans/<id>-plan.md`, post-Gate 3) | `features.<id>` | `backlog \| spec \| plan \| dev \| review \| ship \| done` |

In both cases, update:

- `status: plan` → `status: dev`
- `last_updated: "<today>"`
- `notes: "<refresh — note the plan was approved today, summarize key locked decisions, mention pass count>"`

Bump the global top-level `last_updated` to `"<today>T<HH:MM:00>"` using the current local time.

Use `yq` if available, otherwise plain Edit on the YAML.

#### d. Final report

```
## Plan approved

- Plan: `<PLAN_PATH>` at `Status: approved`, reviewed by <lead-name>
- Tracker: slice `<ID>` at `status: dev`, last_updated `<today>`
- <N> review pass(es) total; <X> Blockers + <Y> Important fixed; <Z> Nits <addressed | left>

Working tree shows the changes uncommitted. Commit + PR per the standard
workflow (e.g. `docs/<id>-plan-approved` branch).

Next: <slice ID>'s implementation can start now if upstream deps are merged,
or wait for <upstream slice> per the spec's Slice dependencies section.
```

### 6. On rejection (option 3)

```
## Plan rejected, kept at Status: draft

Captured findings:
<print the all_findings[] summary table again>

Re-run /forge-plan-review when ready, or rewrite manually if the issues are
structural. The plan file was modified during the cycle — revert with
`git checkout -- <plan-path>` if you want a clean slate.
```

The skill exits without flipping status or touching the tracker.

## Notes

- **Idempotent.** Running on an already-approved plan aborts cleanly. Running on `in-review` continues from there. The skill only flips status on explicit human approval.
- **Max 2 passes.** Pass 1 audits; main session applies fixes; Pass 2 verifies. If Pass 2 still returns `fail-with-issues`, the skill exits with `manual-rewrite-needed` — escalates to human judgment rather than continuing to iterate. The cap reflects what each pass actually buys: Pass 1 carries unique signal (the audit), Pass 2 carries unique signal (verify the fixes); Pass 3+ would be diminishing-returns cascade-detection and is better handled by the human at that point.
- **No auto-approval.** Even if the first pass returns `pass` (zero of everything), the human is asked. The skill never silently flips status.
- **Sub-agent independence.** Each pass invokes a fresh `plan-reviewer` context. The reviewer doesn't see the main session's history — it judges the plan as written, which is the point of the structural-independence design.
- **Nit threshold.** The sub-agent is instructed to keep nits to ≤3 per pass. Floods of nits signal the reviewer is being too pedantic — re-tune `plan-reviewer.md` if observed across multiple runs.
- **Working tree assumption.** Skill operates on the working copy of the plan + tracker. Changes are uncommitted at exit; user commits + PRs separately. Skill does NOT push or open PRs on its own.
- **Read-only fallback.** If invoked on a plan whose spec is missing or unreadable, abort with a clear message rather than running review on incomplete context.
- **Enforced via `guard-plan-approval.sh`.** A PreToolUse hook (`.claude/hooks/guard-plan-approval.sh`) blocks any Edit/Write/MultiEdit that flips a plan's `Status:` to `approved` unless the file carries a `Reviewed-via: /forge-plan-review` annotation. The skill writes this annotation in the same atomic Edit as the status flip (per step 5b), so the hook lets the skill's own approval pass through. **Manual or shortcut approvals that bypass the skill cycle will fail the hook** — the only way to get a plan to `Status: approved` is via this skill (or by manually adding the `Reviewed-via:` line, which counts as honor-system bypass and would be caught at PR review).
