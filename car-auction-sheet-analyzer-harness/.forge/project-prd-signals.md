# [Project Name] — PRD Signals

> Sidecar to [`project-prd.md`](project-prd.md). Carries **live signals only** — open and partial open questions that the engagement still needs to settle.

## What lives here

- **Open questions** raised during PRD authoring, the three engagement gates (`/forge-prd-check`, `/forge-arch-probe`, `/forge-decompose`), or mid-engagement when a new ambiguity surfaces.
- **Only `⏳ open` and `◐ partial` rows.** Once an OQ is answered (`✅`), it moves to [`project-prd-history.md`](project-prd-history.md) `## Resolved Open Questions`, with the answer folded into the PRD body itself. See [`.claude/rules/prd.md`](../.claude/rules/prd.md) for the resolution procedure.

## What does NOT live here

- **The live contract** — problem, domain, scope, NFRs, success criteria — lives in [`project-prd.md`](project-prd.md).
- **Risks** — risks live in `project-prd.md` `## Risks`. They are part of the engagement contract; OQs are not.
- **Resolved questions and PRD revisions** — both live in [`project-prd-history.md`](project-prd-history.md).

## Why the split exists

Mixing live signals and audit trail into the PRD body bloats every read of the contract. Selective loading on the consumer side (e.g. `spec-reviewer` filtering signals by feature ID via the `Blocks` column) is only possible when signals are in their own file. See `.claude/rules/prd.md` for the full rationale and the shape-guard hook contract.

## Status Legend

- ⏳ **open** — no answer yet
- ◐ **partial** — answer in progress; some aspects settled, others outstanding

(Answered ✅ rows live in [`project-prd-history.md`](project-prd-history.md) — not here.)

## Open Questions

> The `Section` column anchors each OQ to a PRD body section (e.g. `§Domain Model`, `§Functional Surface > [Feature X]`) so the answer's eventual home is obvious.
>
> The `Blocks` column lists feature IDs the OQ blocks — comma-separated, or `—` if none. The `spec-reviewer` sub-agent filters this table by feature ID during `/forge-spec-review`, so only OQs relevant to the spec under review are loaded into its context.

| # | Section | Topic | Question | Status | Resolution / Owner | Blocks |
|---|---------|-------|----------|--------|--------------------|--------|
| OQ-1 | §Constraints > Tech Stack | Payment gateway | Which payment gateway(s) for Phase 1 — PayHere (LKR), Stripe (international cards), or both? Decision deferred to architecture phase. | ⏳ open | Product | f-007-b |
| OQ-2 | §Constraints > Tech Stack | LLM provider | Which LLM for translation and extraction — OpenAI GPT-4o, Google Vertex AI, or equivalent? Final selection deferred to architecture phase. | ⏳ open | Engineering | f-003 |
| OQ-3 | §Non-Functional Requirements > Security | Data retention policy | Define time-bound data retention and deletion policy for uploaded sheets and generated reports. Currently retained indefinitely. | ⏳ open | Product | — |
| OQ-4 | §Functional Surface > Integration Points | Email provider | Which email provider for pipeline completion / failure notifications — AWS SES or SendGrid? Decision deferred to infrastructure setup. | ⏳ open | Engineering | f-010 |
| OQ-5 | §Architecture > Deployment Topology | MongoDB hosting | AWS DocumentDB vs. MongoDB Atlas for report content storage. Decision deferred to infrastructure setup. | ⏳ open | Engineering | f-003, f-005 |
