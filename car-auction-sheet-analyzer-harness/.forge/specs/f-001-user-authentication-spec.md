# F-001 User Authentication & Registration — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Provides the identity and session foundation for all user-facing features. Users register via email/password or Google OAuth 2.0, verify their email, and receive 1 free analysis credit on first login. All other features gate access behind a valid JWT.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Email/password registration with email verification
- Google OAuth 2.0 registration and login
- JWT RS256 issuance (claims: user_id, role, tenant_id)
- 24-hour access token / 30-day refresh token
- Password reset via email OTP
- 1 free credit granted on successful registration
- Rate limiting: 5 failed login attempts per 10 minutes per IP

### Out of Scope
- Multi-tenant login flows (Phase 2)
- SSO / SAML (not planned)

## Constraints and Dependencies
- Blocked by: none
- Spring Boot handles auth directly — no managed auth provider (CLAUDE.md Decision #4)
- JWT RS256, RBAC via Spring Security method-level annotations (CLAUDE.md Decision #5)
- Free credit grant triggers F-007-a credit deduction logic (coordinate with F-007-a)

## Input Sources
- PRD §Functional Surface > User Registration and Authentication
- SRS §5 FR-001, §15 Authentication & Authorization

## Open Questions

## Revisions
