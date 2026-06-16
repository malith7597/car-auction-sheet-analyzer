# FS-001 App Shell — Spring Boot

> Status: approved
> Author: malith3
> Reviewed by: malith3 (lead review 2026-06-16)
> Date: 2026-05-31

## Context
Spring Boot application boots with environment config loaded, health endpoint responding, and the development server running. This is the substrate on which all Spring Boot feature work (auth, GraphQL API, WebSocket hub, admin portal) is built.

## Requirements

### Functional Requirements
- Spring Boot 3 / Java 21 application starts without errors
- Health endpoint (`/actuator/health`) returns HTTP 200
- Environment config loaded from `.env` / application properties; mandatory env vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `AWS_REGION`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (see Rev 1)
  - **Deliberate decision — full env contract up front.** FS-001 only *consumes* the DB vars (Flyway on startup). `AWS_REGION` (used by FS-006 SQS / FS-010 S3) and the JWT key pair `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY` (base64-encoded PEM, used by FS-008 auth — RS256 signing needs the private key, verification needs the public key) are mandated now so the env contract is established once at the shell and later slices add no startup-validation surprises. The cost is that booting FS-001 requires placeholder values for these three vars; that is accepted to keep the env contract single-sourced. See § Open Questions for the unresolved `AWS_REGION` value.
- Flyway configured (migrations run on startup against the dev database — no entity migrations yet)
- `docker-compose.yml` providing a local PostgreSQL service, so a clean checkout can boot without external infrastructure
- Base project structure: package layout, dependency injection wired, exception handler skeleton

### Non-Functional Requirements
- Dev server starts in < 30 seconds on a development machine
- All required env vars validated at startup (fail fast with a named-variable error if any are missing)

## Acceptance Criteria
- [ ] `./gradlew bootRun` starts without errors with the dev database running (`docker compose up -d postgres`)
- [ ] `GET /actuator/health` returns `{"status":"UP"}`
- [ ] `GET /actuator/health` is reachable without authentication (endpoint stays public — FS-008 must not lock it down)
- [ ] Missing any of `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `AWS_REGION`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` causes startup to fail with an error message that names the missing variable
- [ ] Flyway runs (no-op with zero migrations is acceptable at this stage)
- [ ] `GET /no-such-endpoint` returns a structured JSON error body in the project envelope `{"success":false,"error":"Not Found","data":null}` (see Rev 1) — not an HTML error page
- [ ] Dev server startup completes in under 30 seconds on a development machine (informally verified)

## Scope Boundaries

### In Scope
- Spring Boot 3 project scaffold (Gradle)
- Package structure: controller / service / repository / config layers
- Application properties / `.env` loading; mandatory env vars enumerated in § Functional Requirements
- Spring Actuator health endpoint (public — no auth)
- Flyway dependency configured (no migrations yet)
- `docker-compose.yml` with a local PostgreSQL service for development boot
- Basic global exception handler (returns structured JSON errors)

### Out of Scope
- Any entity migrations (those ship with the feature that owns the entity)
- Auth (F-008)
- GraphQL wiring (ships with feature specs)
- Any business logic

## Constraints and Dependencies
- Blocked by: none
- Repo: `car-auction-sheet-backend` (directory exists, empty — scaffold the Spring Boot project into it as part of this slice)
- Java 21, Spring Boot 3, Gradle (CLAUDE.md Decision #2)
- Local Postgres via `docker-compose.yml` is a precondition for `bootRun` (Flyway runs on startup)
- AWS region value still TBD — see § Open Questions (architecture.md §Open Questions)

## Input Sources
- architecture.md §Components (Spring Boot API row)
- architecture.md §Foundation Backlog (F-001)

## Open Questions
- **AWS region selection** — `AWS_REGION` is a mandatory startup var (env contract decision above), but the actual region value is unresolved until infrastructure setup. A placeholder is acceptable for FS-001 boot; the real value is decided before the first AWS-touching slice (FS-006 SQS / FS-010 S3). Tracks architecture.md §Open Questions → "AWS region selection".

## Revisions

### Rev 1 — 2026-06-16
- **Changed:** (1) Mandatory JWT env var `JWT_PRIVATE_KEY_PATH` replaced by the key pair `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` (base64-encoded PEM) — mandatory set is now 6 vars. (2) AC#6's structured-error example changed from `{status,error,path}` to the project envelope `{success,error,data}`.
- **Why:** Surfaced during FS-001 plan review (B3, B4). The backend repo's `CLAUDE.md` Stack Profile already mandates the `{success,error,data}` error envelope project-wide and a JWT key pair (RS256 verification requires the public key, which a single private-key path omits). Base64-content keys are also more container-friendly than a mounted file path. The original spec values predated and conflicted with those established conventions.
- **Impact on plan:** FS-001 plan validator now checks 6 vars; `GlobalExceptionHandler` emits the `{success,error,data}` envelope; `.env.example` carries both JWT keys.
- **Approved by:** malith3
