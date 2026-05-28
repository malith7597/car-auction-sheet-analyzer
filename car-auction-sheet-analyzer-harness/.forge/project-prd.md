# [Project Name] — Project PRD

> Status: draft | in-review | approved
> Last updated: YYYY-MM-DD
> Reviewed by: [name(s)]

The single source-of-truth product requirements document for this engagement. Verified by `/forge-prd-check` (Gate 1) before the team commits to delivering against it.

## Gate Status

> Snapshot of engagement-readiness gates. Updated automatically by `/forge-prd-check`, `/forge-arch-probe`, `/forge-decompose` in full mode. Detailed run history lives in [`engagement-gate-runs.md`](engagement-gate-runs.md). Structured state and accepted risks/spikes live in [`tracker.yaml`](tracker.yaml) under `setup.*`.

| Gate | Status | Last Run | Risks / Spikes | Detail |
|------|--------|----------|----------------|--------|
| 1. PRD Readiness (`/forge-prd-check`) | ⏳ not-started | — | — | — |
| 2. Architecture & Feasibility (`/forge-arch-probe`) | ⏳ not-started | — | — | — |
| 3. Decomposition (`/forge-decompose`) | ⏳ not-started | — | — | — |

Status legend: ⏳ not-started · 🚧 in-progress · ✅ passed · ⚠️ passed-with-risks · ⚠️ passed-with-spikes · ❌ failed

## Problem Statement

<!-- What problem does this system solve? Why does it need to exist? -->

## Industry / Domain Context

<!-- Brief context on the industry, regulatory environment, or domain norms.
     Sources: web research, client briefings, reference systems. -->

## Business Specifics

<!-- Specific to *this* business — org structure, current pains, legacy systems being replaced.
     Sources: client meetings, screenshots, legacy-system audit. -->

## Scope and Boundaries

### In Scope (V1)

<!-- Features and capabilities included in v1. Each gets a one-paragraph description below in §6. -->

### Out of Scope

<!-- Features explicitly NOT included. Negative space matters as much as positive — record so client expectations stay aligned. -->

### Deferred (Post-V1)

<!-- Features deferred to a later phase, with reasoning and trigger condition. Distinct from out-of-scope. -->

### Phasing / Sequencing Intent

<!-- Even loosely — what comes first and why. Architecture and decomposition will firm this up. -->

## Domain Model

### Key Entities

| Entity | Description | Key Relationships |
|--------|-------------|-------------------|
| | | |

### Lifecycle States

<!-- For entities with non-trivial state machines, document the states.
     Example: application: draft → submitted → approved → rejected -->

### Glossary

<!-- Client-specific or domain-specific terminology. Anything an engineer would have to ask about. -->

| Term | Meaning |
|------|---------|
| | |

## Users and Access

### Roles

| Role | Description | Primary Capabilities |
|------|-------------|----------------------|
| | | |

### Multi-Tenancy / Org Hierarchy

<!-- If the system serves multiple organizations or has hierarchical ownership, document the model.
     Skip if N/A. -->

## Functional Surface

<!-- One subsection per in-scope feature. Each gets at least a paragraph.
     Reference user journeys and integration points. -->

### [Feature 1]

### [Feature 2]

### User Journeys

<!-- Headline flows that span multiple features. Mermaid sequence diagrams help here. -->

### Integration Points

<!-- External systems this product talks to. -->

| System | Direction | Purpose |
|--------|-----------|---------|
| | | |

## Non-Functional Requirements

### Performance

<!-- Order-of-magnitude expectations. Concurrent users, response times, data volumes. -->

### Security and Compliance

<!-- Auth requirements, data classification, regulatory regimes (GDPR, HIPAA, etc.). -->

### Accessibility

<!-- WCAG level commitment, assistive-tech support expectations. -->

### Observability and Audit

<!-- Logging, monitoring, audit-trail requirements. -->

## Constraints

### Tech Stack

<!-- Mandatory vs. preferred vs. open. -->

### Regulatory

### Deployment and Hosting

## Input Sources

<!-- Where did the requirements come from? Reference system, client meetings, mockups, web research, etc. -->

| Source | Date / Version | Used For |
|--------|----------------|----------|
| | | |

## Risks

<!-- Known unknowns that may bite us during implementation. Owner + status per row.
     OPEN QUESTIONS DO NOT LIVE HERE — see project-prd-signals.md (sidecar file).
     A path-scoped rule (.claude/rules/prd.md) and a PreToolUse hook
     (guard-prd-shape.sh) enforce the split; trying to add an OQ row to this
     file will be blocked. -->

| # | Item | Owner | Status |
|---|------|-------|--------|
| | | | |

## Success Criteria

<!-- How will we know we delivered the right thing? Both functional acceptance and business outcomes. -->

## Sidecar Files

This PRD is the **live contract** — the frozen-at-Gate-1 statement of what we are building. Two sidecar files carry the content classes that change post-Gate-1 or are pure bookkeeping:

| File | Contents | Lifecycle |
|------|----------|-----------|
| [`project-prd-signals.md`](project-prd-signals.md) | Live signals — open and partial open questions, anchored to PRD sections and (optionally) to features that they block. | Authored as questions surface (interview, gates, mid-engagement). Resolved by folding the answer into this PRD body and moving the row to `project-prd-history.md`. |
| [`project-prd-history.md`](project-prd-history.md) | Audit trail — resolved open questions and PRD revisions. | Append-only. |

The OQ resolution procedure and shape-enforcement rules live in [`.claude/rules/prd.md`](../.claude/rules/prd.md) (path-scoped — loads when any `project-prd*.md` file is read or edited).
