# F-006 Analysis History & Real-time Notification — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Provides the user's personal record book of past analyses and the real-time mechanism that notifies the user when a pipeline completes. Users can browse their history, re-open any past report, and receive a WebSocket push notification when a new analysis finishes.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Paginated list of user's analyses (completed + failed) with status, date, vehicle summary
- Re-open link to F-005 report viewer for any past analysis
- WebSocket push notification on pipeline completion (Spring Boot → React SPA)
- Analysis history retained indefinitely while account is active

### Out of Scope
- Report viewer (F-005)
- Email fallback notification (F-010)
- Multi-vehicle comparison (Phase 4)

## Constraints and Dependencies
- Blocked by: F-001 (auth), F-005 (reports must exist to show)
- WebSocket hub in Spring Boot (CLAUDE.md Decision #7; foundation slice F-009)

## Input Sources
- PRD §Functional Surface > Analysis History
- SRS §5 FR-012, §18 Frontend Module Design

## Open Questions

## Revisions
