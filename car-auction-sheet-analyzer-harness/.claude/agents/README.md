# Forge Harness — Sub-Agents

Sub-agents in this directory are **read-only sensor roles** invoked via the Task tool by main Claude. They run with their own context and produce structured findings for the main session to act on.

## Pattern

Sub-agents come in two flavors per the framework doctrine (`forge-harness-framework.md` §3.6):

- **Guides** — interactive, stay in the main session because their quality depends on dialogue with the developer (spec authoring, plan authoring, implementation).
- **Sensors** — read-only, run independently because adversarial independence from the writing session is the point (review, verification).

This directory is for **sensors**. Guides do not live here.

Each sensor sub-agent should:
- Have read-only tools (no `Edit`, `Write`, `MultiEdit`).
- Accept inputs via the dispatch prompt (caller provides paths, versions, scope).
- Produce a deterministic output structure: verdict, findings table, recommendation.
- Be advisory by default — the human (via main Claude) decides whether to act.

## Currently Wired

| Sub-agent | Invoked when | Reviews |
|---|---|---|
| `harness-sync-reviewer.md` | At the end of every upstream forge-harness sync | CHANGELOG.yaml application correctness — every declared change applied, tracker.yaml.harness_version bumped, no scope creep, no clobbered customizations |
| `spec-reviewer.md` | Each pass of `/forge-spec-review` (fresh context per pass) | Feature spec audit against `_TEMPLATE-spec.md`, PRD, architecture decisions, dependent specs, and CLAUDE.md required sections — produces Blockers / Important / Nits findings. Foundation specs are out of scope. |
| `plan-reviewer.md` | Each pass of `/forge-plan-review` (fresh context per pass) | Plan audit against its spec, harness conventions, and toolchain pitfalls — produces Blockers / Important / Nits findings. |

## Future Pattern Slots (Not Currently Wired)

- **Adversarial code reviewer** — reviews diffs against a spec/plan, flags semantic mismatches and missed edge cases. Pattern preserved per framework.md §3.6; will return when a `/forge-review` command is reintroduced through real engagement experience.
- **Security reviewer** — reviews code for OWASP-style issues using a project threat model (`.forge/design/threat-model.md`) when present. Pattern preserved per framework.md §3.6; will return with a `/vuln-check` command.

## Why "read-only"

If a sensor sub-agent could write files, the main session would be tempted to push fix-up logic into the reviewer (because the agent has just inspected the code and "knows" the answer). That collapses the adversarial-independence boundary — the same agent both writes and reviews, which is the failure mode this pattern exists to prevent. Keep the tools read-only and let main Claude do the writes after reading the verdict.
