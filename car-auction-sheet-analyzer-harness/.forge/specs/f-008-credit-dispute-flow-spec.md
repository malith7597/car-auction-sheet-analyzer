# F-008 Credit Dispute Flow — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Allows users to request a credit refund when an Analysis fails. A user submits a CreditDisputeRequest; Support Admin reviews the failure context, approves (credit restored via F-007-a) or declines, and records the decision. Kept as one feature: single dispute lifecycle state machine.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- CreditDisputeRequest entity DDL + migration
- User dispute submission endpoint + React form (on failed Analysis)
- Maximum 1 dispute per Analysis enforced
- CreditDisputeRequest state machine: submitted → under_review → approved / declined
- Support Admin dispute queue (feeds into F-009-a)
- Credit restoration on approval (calls F-007-a service)
- Decision + reason recorded on all outcomes

### Out of Scope
- Admin portal UI (F-009-a)
- Pipeline step inspection (F-009-b)
- Email notification of dispute outcome (F-010)

## Constraints and Dependencies
- Blocked by: F-003 (failed Analysis must exist to dispute), F-007-a (credit restoration service)
- F-009-a depends on this (dispute queue)
- F-010 depends on this (failure email includes dispute link)

## Input Sources
- PRD §Functional Surface > Credit Dispute Flow
- PRD §Domain Model > Lifecycle States (CreditDisputeRequest)
- PRD §Users and Access > Per-Role Matrix (Individual User, Support Admin)

## Open Questions

## Revisions
