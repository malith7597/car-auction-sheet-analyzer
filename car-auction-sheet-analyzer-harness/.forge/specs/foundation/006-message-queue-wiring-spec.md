# F-006 Message Queue Wiring

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
AWS SQS producer wired in Spring Boot and SQS consumer wired in FastAPI worker. A hello-world job round-trip (Spring Boot enqueues → FastAPI receives, processes, acknowledges) proves the async pipeline backbone before any AI pipeline work begins.

## Requirements

### Functional Requirements
- Spring Boot can enqueue a message to the SQS queue
- FastAPI worker receives the message and acknowledges (deletes from queue)
- Hello-world job payload: `{ "analysis_id": "<uuid>", "type": "hello_world" }`
- Failed message handling: message visibility timeout + DLQ after N retries

### Non-Functional Requirements
- Message enqueue latency < 500ms (p95)
- Worker polls continuously without busy-waiting (long polling, 20s)

## Acceptance Criteria
- [ ] Spring Boot enqueues hello-world message; FastAPI worker receives and logs it within 5 seconds
- [ ] Unprocessable message ends up in DLQ after configured retry count
- [ ] SQS queue URL and credentials loaded from environment config (no hardcoded values)

## Scope Boundaries

### In Scope
- AWS SQS Standard queue setup (infrastructure-as-code or manual for dev)
- Spring Boot SQS producer (AWS SDK v2)
- FastAPI worker SQS consumer (boto3 long polling)
- Dead-letter queue configuration
- Hello-world message handler in FastAPI worker
- Message visibility timeout configuration

### Out of Scope
- Analysis pipeline job handler (F-003)
- gRPC callbacks (F-007)

## Constraints and Dependencies
- Blocked by: F-001 (Spring Boot), F-002 (FastAPI worker)
- Async pipeline via AWS SQS (CLAUDE.md Decision #1)
- DLQ retry count TBD (architecture.md §Open Questions)

## Input Sources
- architecture.md §Components (AWS SQS row)
- architecture.md §Data Flow (sequence diagram)
- architecture.md §Foundation Backlog (F-006)

## Open Questions

## Revisions
