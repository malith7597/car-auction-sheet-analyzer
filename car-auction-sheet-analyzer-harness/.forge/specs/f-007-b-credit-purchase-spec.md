# F-007-b Credit Purchase — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Surface sibling of F-007 (substrate-cut). Provides the credit purchase flow: users browse available credit packages, pay via the payment gateway, and receive credits in their account. Also includes BillingConfig management (configurable by Super Admin in F-009-c).

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Credit package listing (packages configurable by Super Admin via F-009-c)
- Payment gateway integration (TBD — OQ-1: PayHere / Stripe)
- Credit grant on successful payment (calls F-007-a credit service)
- BillingConfig entity DDL + migration (credit packages, pricing)
- Purchase UI (React credit purchase flow)
- Payment success / failure feedback

### Out of Scope
- Credit deduction / restoration (F-007-a)
- BillingConfig admin management UI (F-009-c)

## Constraints and Dependencies
- Blocked by: F-007-a (credit service must exist)
- Payment gateway TBD — OQ-1 blocks final implementation
- BillingConfig consumed by F-009-c for management

## Input Sources
- PRD §Functional Surface > Credit Management
- PRD §Business Specifics (LKR 150–500 per analysis, LKR 5,000–25,000/month subscription)
- SRS §16 Payment Flow

## Open Questions

## Revisions
