# F-004 Data Layer — PostgreSQL

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
AWS RDS PostgreSQL connection established, Flyway migration tooling configured and running on startup, and Spring Data JPA repository base classes wired. No entity migrations yet — those ship with the feature that owns each entity.

## Requirements

### Functional Requirements
- Spring Boot connects to PostgreSQL on startup
- Flyway runs on startup with zero migrations (clean baseline)
- JPA / Spring Data repository pattern available (base repository interface)
- Transaction management configured
- Connection pool configured (HikariCP defaults acceptable)

### Non-Functional Requirements
- Connection pool sized for early-market load
- Connection failure causes startup to fail with a clear error (fail fast)

## Acceptance Criteria
- [ ] Spring Boot starts and logs successful PostgreSQL connection
- [ ] Flyway baseline migration runs without error (no-op at zero migrations)
- [ ] A smoke-test repository `findById` call succeeds against an empty DB

## Scope Boundaries

### In Scope
- PostgreSQL 15 datasource configuration
- HikariCP connection pool
- Flyway dependency + baseline config (migrations path: `classpath:db/migration`)
- Spring Data JPA base repository interface
- JPA entity base class (auditing fields: created_at, updated_at)
- Test database config (H2 or Testcontainers PostgreSQL for unit tests)

### Out of Scope
- Any entity DDL migrations (those ship with each feature spec)
- MongoDB (F-005)
- Schema design (covered per feature)

## Constraints and Dependencies
- Blocked by: F-001 (Spring Boot must be running)
- PostgreSQL 15, Flyway, Spring Data JPA (architecture.md §Components)
- RDS PostgreSQL on AWS (architecture.md §Deployment Topology)

## Input Sources
- architecture.md §Components (PostgreSQL row)
- architecture.md §Foundation Backlog (F-004)

## Open Questions

## Revisions
