# Engagement Gate Runs

> Append-only audit log for the three pre-implementation gates: PRD readiness, architecture probe, decomposition.
>
> **Format:** newest entry on top. One `## Gate N Run M` block per run. Updated automatically by `/forge-prd-check`, `/forge-arch-probe`, `/forge-decompose` in full mode (skipped in `dry-run` mode).
>
> **Why this file exists:** the engagement-level artifacts (PRD, architecture, backlog) don't have a natural lifecycle-metadata section like specs do (`## Revisions`). This file is their shared audit trail. Per-feature gates (spec review, plan review, adversarial review, security review) record their findings inside the per-feature spec / plan artifacts and do **not** appear here. Tool-call-level gates (hooks) are ephemeral and do **not** appear here.
>
> **Audit storage principle:** see `.claude/rules/tracker.md` "Gate Audit Protocol" section.

---

<!-- Example entry shape — delete after first real run. The findings table here matches the output `/forge-prd-check` step 4 produces; dry-run preview and full-mode write are identical. -->

<!--
## Gate 1 Run 1 — YYYY-MM-DD (Runner Name)

**Mode:** full
**Outcome:** pass-with-risks
**Trigger:** end-of-discovery checkpoint

| Section | Item | Status | Reasoning |
|---|---|---|---|
| Scope and boundaries | In-scope features explicitly listed | ✅ | §Scope > In Scope enumerates the V1 modules. |
| Scope and boundaries | Out-of-scope features explicitly listed (incl. negative-space exclusions, with won't-build reason) | ❌ | Out-of-Scope table exists but every reason is deferral-style; no won't-build items, no negative-space exclusions a comparable system would normally include. |
| Domain model | Key entities named | ✅ | §Business Domain — Key Entities defines the core entities. |
| Users and access | Per-role capabilities — explicit per-role × per-resource Create/Read/Update/Delete/Approve/Configure breakdown | ❌ | Narrative descriptions only; no explicit role × resource matrix. |
| Honesty | Success criteria stated | ➖ | Checklist marks N/A — success criteria deferred until the first feature lands. |

**Risks accepted:**

| ID | Owner | Reasoning |
|---|---|---|
| R-PRD-001 | <owner> | will be added before sprint kickoff |
| R-PRD-002 | <owner> | accepted; will be addressed in Foundation phase |
-->
