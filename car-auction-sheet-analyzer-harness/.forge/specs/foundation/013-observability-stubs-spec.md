# FS-013 Observability Stubs

> Status: draft
> Author: malith3
> Reviewed by:
> Date: 2026-06-01

## Context

Structured logging and correlation ID propagation must be wired into all three services before any business logic ships. Without this substrate, production incidents become debugging marathons — logs are unstructured, requests can't be traced across services, and errors are swallowed silently. This slice establishes the minimum observability layer: structured JSON logs in all three services, a correlation ID that flows from the frontend through the API and into the worker, and a basic error reporter wired to each service.

## Requirements

### Functional Requirements

**Spring Boot API:**
- Logback configured for structured JSON output (one JSON object per log line)
- Every log entry includes: `timestamp`, `level`, `service` (`auction-api`), `correlation_id`, `message`
- `correlation_id` generated at request entry (UUID v4) and attached to MDC for all downstream log calls within the same request
- `correlation_id` propagated into SQS job payload and into gRPC metadata headers
- `correlation_id` extracted from incoming requests (header: `X-Correlation-ID`) when present; generated if absent
- Unhandled exceptions logged at ERROR level with full stack trace and correlation ID before returning a structured error response

**FastAPI worker:**
- Python `structlog` (or equivalent) configured for JSON output
- Every log entry includes: `timestamp`, `level`, `service` (`auction-worker`), `correlation_id`, `message`
- `correlation_id` extracted from SQS job payload and bound to all log calls for the duration of that job
- Unhandled exceptions captured, logged at ERROR level with correlation ID, and re-raised (or pushed to DLQ)

**React SPA:**
- Console errors in production mode prefixed with a `[auction-ui]` tag
- `X-Correlation-ID` header sent on all GraphQL and WebSocket requests (generated client-side per session as UUID v4)
- No external error reporting service in Phase 1 (stubs only — hook point documented for future Sentry or similar)

**Shared:**
- Correlation ID format: UUID v4 (`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- Header name: `X-Correlation-ID` (consistent across all services)
- Log level controlled via environment variable (`LOG_LEVEL`: debug / info / warn / error)

### Non-Functional Requirements

- Structured JSON logs parseable by AWS CloudWatch Log Insights (no multi-line plain-text entries)
- No performance overhead above 5 ms per request from logging middleware

## Acceptance Criteria

- [ ] Spring Boot request log shows JSON with `correlation_id` field on every HTTP request
- [ ] SQS job payload includes `correlation_id` field propagated from the enqueuing request
- [ ] FastAPI worker log shows JSON with `correlation_id` field matching the job payload value
- [ ] An uncaught exception in Spring Boot logs full stack trace as a JSON ERROR entry with correlation ID, then returns a `500` structured error response
- [ ] An uncaught exception in FastAPI worker logs full stack trace as a JSON ERROR entry with correlation ID
- [ ] React SPA GraphQL requests include `X-Correlation-ID` header visible in browser DevTools Network tab
- [ ] `LOG_LEVEL=debug` causes debug-level log lines to appear; `LOG_LEVEL=warn` suppresses them

## Scope Boundaries

### In Scope

- Logback JSON configuration (Spring Boot)
- `structlog` JSON configuration (FastAPI)
- MDC-based correlation ID propagation (Spring Boot)
- SQS job payload correlation ID field
- gRPC metadata correlation ID propagation
- React Apollo (or fetch) middleware to attach `X-Correlation-ID`
- Environment variable `LOG_LEVEL`
- Documentation of the hook point for future external error reporting

### Out of Scope

- Distributed tracing (OpenTelemetry, AWS X-Ray) — out of scope for Phase 1
- External error reporting service (Sentry, Rollbar) — stub only
- Metrics / dashboards (CloudWatch custom metrics, Grafana) — out of scope for Phase 1
- Log retention policy and CloudWatch configuration (infrastructure setup)
- Business-event audit logging (ships with the features that produce audit events)

## Constraints and Dependencies

- Blocked by: FS-001 (Spring Boot app shell), FS-002 (FastAPI worker app shell), FS-003 (React SPA app shell)
- Spring Boot: Logback (bundled with Spring Boot Starter Logging) + `logstash-logback-encoder`
- FastAPI: `structlog` library
- React: Apollo Client link middleware (or fetch interceptor) for header injection
- AWS CloudWatch is the log sink (architecture.md §Cross-Cutting Concerns: Observability)

## Input Sources

- architecture.md §Cross-Cutting Concerns (Observability section)
- architecture.md §Foundation Backlog (F-013)
- CLAUDE.md (correlation ID propagation via SQS and gRPC — architecture decision context)
- project-prd.md §NFR > Observability

## Open Questions

## Revisions
