# F-002 App Shell — FastAPI Worker

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Python FastAPI worker application boots, connects to AWS SQS, and processes a hello-world job end-to-end. This is the substrate for all pipeline worker code (OCR, LLM, mesh.ai, MongoDB writes).

## Requirements

### Functional Requirements
- FastAPI app starts without errors
- Health endpoint (`/health`) returns HTTP 200
- SQS consumer loop starts and polls for messages
- Hello-world job: Spring Boot enqueues a test message → worker receives, processes, acknowledges
- Environment config loaded (SQS queue URL, AWS credentials, MongoDB URI, etc.)

### Non-Functional Requirements
- Worker starts in < 15 seconds
- Failed message handling: unprocessable messages sent to dead-letter queue after N retries

## Acceptance Criteria
- [ ] `uvicorn main:app` starts without errors
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Worker receives and acknowledges a hello-world SQS message
- [ ] DLQ receives message after max retries exceeded (manual test)

## Scope Boundaries

### In Scope
- FastAPI 0.100+ project scaffold
- SQS consumer loop (boto3 or equivalent)
- Hello-world job handler
- Environment config loading
- Dead-letter queue configuration (SQS side)
- Basic structured logging (wired in step F-013)

### Out of Scope
- PaddleOCR, LLM, mesh.ai integration (F-003, F-004)
- MongoDB writes (F-005)
- gRPC server/client (F-007)
- Any pipeline business logic

## Constraints and Dependencies
- Blocked by: none (can run in parallel with F-001)
- Repo: `<worker-repo>` (does not exist yet)
- Python 3.11, FastAPI (CLAUDE.md Decision #2)
- AWS SQS Standard queue (CLAUDE.md Decision #1)
- DLQ retry count TBD (architecture.md §Open Questions)

## Input Sources
- architecture.md §Components (Python FastAPI Worker row)
- architecture.md §Foundation Backlog (F-002)

## Open Questions

## Revisions
