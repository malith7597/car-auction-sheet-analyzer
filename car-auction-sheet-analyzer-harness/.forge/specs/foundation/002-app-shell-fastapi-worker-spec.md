# FS-002 App Shell — FastAPI Worker

> Status: draft
> Author: malith3
> Reviewed by:
> Date: 2026-05-31 (drafted) · 2026-06-17 (finalized for approval)

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
- [ ] Missing required config (e.g. `SQS_QUEUE_URL`, `AWS_REGION`) fails fast at startup, naming the missing variable (mirrors FS-001's env-validation contract)
- [ ] `docker compose up` starts a **LocalStack** SQS service; the worker connects to it and its DLQ on boot
- [ ] Worker receives, processes, and acknowledges (deletes) a hello-world SQS message enqueued against the LocalStack queue
- [ ] DLQ receives a message after max receive count exceeded (verified against LocalStack — automatable, no manual AWS step)

## Scope Boundaries

### In Scope
- FastAPI 0.100+ project scaffold (Python 3.11)
- SQS consumer loop (boto3)
- Hello-world job handler
- Environment config loading + fail-fast validation naming the missing variable
- Dead-letter queue configuration (SQS side)
- **LocalStack SQS via `docker-compose`** — the local-dev + integration-test substrate (the FastAPI analog of FS-001's docker-compose Postgres); main queue + DLQ provisioned on stack start
- Basic structured logging (fully wired in FS-013)

### Out of Scope
- PaddleOCR, LLM, mesh.ai integration (F-003, F-004)
- MongoDB writes (F-005)
- gRPC server/client (F-007)
- Any pipeline business logic

## Constraints and Dependencies
- Blocked by: none (can run in parallel with FS-001, now shipped)
- **Repo/location: `car-auction-sheet-worker/` — a new subdirectory of the existing `car-auction-sheet-analyzer` monorepo** (same layout as `car-auction-sheet-backend/` and `car-auction-sheet-frontend/`; the workspace is a single git repo rooted at the parent, not separate per-service repos). The scaffold is created during implementation, after this spec and the plan are approved.
- Python 3.11, FastAPI (CLAUDE.md Decision #2)
- AWS SQS Standard queue in prod (CLAUDE.md Decision #1); **LocalStack** SQS for local dev + tests
- DLQ `maxReceiveCount` — see Open Questions (proposed default below)

## Input Sources
- architecture.md §Components (Python FastAPI Worker row)
- architecture.md §Foundation Backlog (F-002)
- FS-001 (App shell — Spring Boot, shipped PR #6) — env-validation + docker-compose-substrate patterns this slice mirrors on the Python side

## Open Questions
- **OQ-FS002-1 — DLQ `maxReceiveCount`.** Architecture left the retry count TBD. Proposed default: **3** (deliver→fail 3× → DLQ), consistent with a typical SQS Standard setup. Confirm at approval, or set a project-wide value.
- **OQ-FS002-2 — `AWS_REGION` for local/dev.** FS-001 lists `AWS_REGION` as a required env var but the real dev region is still open (architecture.md §Open Questions). For LocalStack the region is arbitrary (e.g. `us-east-1`); the prod value can be resolved later without affecting this slice.

## Revisions
