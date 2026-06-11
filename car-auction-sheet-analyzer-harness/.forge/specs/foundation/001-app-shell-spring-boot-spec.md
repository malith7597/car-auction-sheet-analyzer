# F-001 App Shell — Spring Boot

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Spring Boot application boots with environment config loaded, health endpoint responding, and the development server running. This is the substrate on which all Spring Boot feature work (auth, GraphQL API, WebSocket hub, admin portal) is built.

## Requirements

### Functional Requirements
- Spring Boot 3 / Java 21 application starts without errors
- Health endpoint (`/actuator/health`) returns HTTP 200
- Environment config loaded from `.env` / application properties (database URL, AWS region, JWT secret, etc.)
- Flyway configured (migrations run on startup — no entity migrations yet)
- Base project structure: package layout, dependency injection wired, exception handler skeleton

### Non-Functional Requirements
- Dev server starts in < 30 seconds
- All required env vars validated at startup (fail fast if missing)

## Acceptance Criteria
- [ ] `./mvnw spring-boot:run` starts without errors on a clean checkout
- [ ] `GET /actuator/health` returns `{"status":"UP"}`
- [ ] Missing required env var causes startup to fail with a clear error message
- [ ] Flyway runs (no-op with zero migrations is acceptable at this stage)

## Scope Boundaries

### In Scope
- Spring Boot 3 project scaffold (Maven)
- Package structure: controller / service / repository / config layers
- Application properties / `.env` loading
- Spring Actuator health endpoint
- Flyway dependency configured (no migrations yet)
- Basic global exception handler (returns structured JSON errors)

### Out of Scope
- Any entity migrations (those ship with the feature that owns the entity)
- Auth (F-008)
- GraphQL wiring (ships with feature specs)
- Any business logic

## Constraints and Dependencies
- Blocked by: none
- Repo: `<backend-repo>` (does not exist yet — create as part of this slice)
- Java 21, Spring Boot 3, Maven (CLAUDE.md Decision #2)
- AWS region TBD (OQ — architecture.md §Open Questions)

## Input Sources
- architecture.md §Components (Spring Boot API row)
- architecture.md §Foundation Backlog (F-001)

## Open Questions

## Revisions
