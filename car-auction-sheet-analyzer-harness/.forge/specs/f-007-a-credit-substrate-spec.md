# F-007-a Credit Substrate — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Substrate sibling of F-007 (substrate-cut). Provides the Credit and CreditTransaction entity DDL, credit deduction service (consumed by F-002-a on upload), credit restoration service (consumed by F-008 on dispute approval), balance read endpoint, and the free credit grant on user registration. F-007-b (credit purchase) depends on this substrate.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Credit entity DDL + migration (individual credit records, status: available / consumed / refunded)
- CreditTransaction entity DDL + migration (ledger entries per user)
- Credit deduction service: check balance, deduct 1 credit, record CreditTransaction
- Credit restoration service: restore 1 credit on dispute approval, record CreditTransaction
- Credit balance read endpoint
- Free credit grant (1 credit) on user registration event from F-001

### Out of Scope
- Credit purchase flow and payment gateway (F-007-b)
- BillingConfig / credit package management (F-007-b)
- Purchase UI (F-007-b)

## Constraints and Dependencies
- Blocked by: F-001 (user must exist for credit to be attached)
- F-002-a and F-008 are schema-only/service consumers of this substrate
- F-007-b depends on this

## Input Sources
- PRD §Functional Surface > Credit Management
- PRD §Domain Model > Key Entities (Credit, CreditTransaction)
- SRS §5 FR-013–FR-015, §16 Payment Flow

## Open Questions

## Revisions
