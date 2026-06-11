# F-009-b Technical Admin Portal — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Internal portal for Technical Admin role. Provides pipeline step inspection, error log viewing, and pipeline intervention (edit step output + resume from any step via gRPC). Second cluster of the F-009 cluster-cut (3 admin role views).

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Analysis search and list (all users, filtered by status: failed / needs_review)
- PipelineStep detail view per Analysis (raw inputs, outputs, confidence scores, error logs, timing)
- Pipeline intervention: edit PipelineStep output data
- Pipeline resume: trigger resume from corrected step (gRPC call to FastAPI worker)
- System processing metrics (queue depth, average latency, error rates)
- Access gated to Technical Admin role (JWT role claim)

### Out of Scope
- Dispute queue (F-009-a)
- Billing config (F-009-c)

## Constraints and Dependencies
- Blocked by: F-003 (PipelineStep entity must exist)
- Intervention + resume via gRPC (CLAUDE.md Decision #6; foundation slice F-007)
- F-009-c depends on this (Super Admin is a superset)

## Input Sources
- PRD §Users and Access > Per-Role Matrix (Technical Admin row)
- PRD §Functional Surface > Admin Portal
- PRD §Domain Model > Analysis lifecycle states (intervention)

## Open Questions

## Revisions
