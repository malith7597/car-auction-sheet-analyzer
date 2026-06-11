# F-009-a Support Admin Portal — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Internal portal for Support Admin role. Provides the dispute queue, user search, and manual credit balance adjustment capabilities. First cluster of the F-009 cluster-cut (3 admin role views).

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- CreditDisputeRequest queue view (all pending disputes)
- Dispute detail view with Analysis context and PipelineStep summary
- Approve / decline dispute actions (calls F-008 / F-007-a services)
- User search by email / name
- Manual credit balance adjustment with reason (calls F-007-a service)
- Access gated to Support Admin role (JWT role claim)

### Out of Scope
- Pipeline step inspection (F-009-b)
- Billing config management (F-009-c)
- AdminAccount management (F-009-c)

## Constraints and Dependencies
- Blocked by: F-008 (dispute entity must exist)
- F-009-c depends on this (Super Admin is a superset)

## Input Sources
- PRD §Users and Access > Per-Role Matrix (Support Admin row)
- PRD §Functional Surface > Admin Portal

## Open Questions

## Revisions
