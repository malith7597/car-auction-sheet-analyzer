# F-009-c Super Admin Portal — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Internal portal for Super Admin role. Supersedes F-009-a (Support Admin) and F-009-b (Technical Admin) capabilities, adding billing configuration, AdminAccount CRUD, and platform-wide audit logs. Third cluster of the F-009 cluster-cut (3 admin role views).

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- All F-009-a (Support Admin) capabilities
- All F-009-b (Technical Admin) capabilities
- BillingConfig management: create / update credit packages and pricing (consumed by F-007-b)
- AdminAccount CRUD: create, update, deactivate Support Admin / Technical Admin accounts
- Platform-wide audit log viewer (all credit movements, dispute decisions, admin actions)
- User account deactivation
- Access gated to Super Admin role (JWT role claim)

### Out of Scope
- End-user-facing features (handled by other feature specs)

## Constraints and Dependencies
- Blocked by: F-007-b (BillingConfig entity), F-009-a (dispute queue capabilities), F-009-b (pipeline inspection capabilities)
- AdminAccount entity DDL + migration owned by this feature

## Input Sources
- PRD §Users and Access > Per-Role Matrix (Super Admin row)
- PRD §Functional Surface > Admin Portal

## Open Questions

## Revisions
