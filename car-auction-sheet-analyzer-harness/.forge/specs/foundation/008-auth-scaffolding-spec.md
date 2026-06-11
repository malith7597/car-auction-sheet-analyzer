# F-008 Auth Scaffolding

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
JWT RS256 issue and validation wired in Spring Boot, Google OAuth 2.0 flow configured, and RBAC annotations active on placeholder endpoints. No user registration or login UI (those ship with product feature f-001) — this slice produces the auth infrastructure that feature specs depend on.

## Requirements

### Functional Requirements
- Spring Security configured with JWT RS256 filter
- RS256 key pair generated and loaded from environment config
- JWT tokens validated on protected endpoints; unauthenticated requests return HTTP 401
- Google OAuth 2.0 client configured (client ID/secret from env)
- Spring Security method-level `@PreAuthorize` with role checks works on a test endpoint
- JWT claims model: `user_id`, `role`, `tenant_id` (null for Phase 1)

### Non-Functional Requirements
- JWT validation adds < 5ms overhead per request

## Acceptance Criteria
- [ ] Protected test endpoint returns 401 without a valid JWT
- [ ] Protected test endpoint returns 200 with a valid JWT
- [ ] `@PreAuthorize("hasRole('SUPER_ADMIN')")` blocks a request with role `INDIVIDUAL_USER`
- [ ] Google OAuth 2.0 configuration loads without errors on startup (actual OAuth flow ships with f-001)

## Scope Boundaries

### In Scope
- Spring Security JWT filter (RS256 validate)
- JWT minting utility (for use in f-001 and tests)
- Google OAuth 2.0 Spring Security client configuration (no callback handler yet)
- Role enum: `INDIVIDUAL_USER`, `SUPPORT_ADMIN`, `TECHNICAL_ADMIN`, `SUPER_ADMIN`
- `@PreAuthorize` annotation support wired
- Security config: which paths are public vs protected

### Out of Scope
- User registration / login endpoints (product feature f-001)
- Password hashing, email OTP, refresh token rotation (f-001)
- Rate limiting (ships with f-001)

## Constraints and Dependencies
- Blocked by: F-001 (Spring Boot), F-004 (PostgreSQL — user lookup will need DB)
- Spring Boot handles auth directly, no managed provider (CLAUDE.md Decision #4)
- JWT RS256, RBAC via Spring Security method level (CLAUDE.md Decision #5)

## Input Sources
- architecture.md §Cross-Cutting Concerns > Authentication and Authorisation
- PRD §Users and Access (role definitions)
- architecture.md §Foundation Backlog (F-008)

## Open Questions

## Revisions
