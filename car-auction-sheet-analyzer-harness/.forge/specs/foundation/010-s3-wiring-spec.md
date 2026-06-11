# FS-010 S3 Wiring

> Status: draft
> Author: malith3
> Reviewed by:
> Date: 2026-06-01

## Context

AWS S3 is the durable object store for uploaded auction sheet files and generated report PDFs. Both the Spring Boot API and the FastAPI worker need to upload and download objects. This slice wires the AWS SDK into both services and validates the round-trip before any feature work touches file storage.

## Requirements

### Functional Requirements

- Spring Boot can upload a file to S3 and download it back via AWS SDK v2 (`software.amazon.awssdk`)
- FastAPI worker can upload a file to S3 and download it back via `boto3`
- S3 bucket configured with SSE-AES256 (server-side encryption)
- Bucket versioning enabled (infrastructure-level setting)
- A shared `StorageService` abstraction in Spring Boot (upload, download, presigned URL) used by all callers
- A shared `s3_client` helper in the Python worker (upload, download) used by all pipeline steps
- Local development uses LocalStack (or env-variable-switched real S3) — no real AWS required for `./dev` workflow

### Non-Functional Requirements

- Upload and download of a 5 MB file complete in under 5 seconds on a local dev network
- Credentials sourced exclusively from environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`) — no hardcoded values

## Acceptance Criteria

- [ ] Spring Boot `StorageService.upload(key, bytes)` stores an object; `StorageService.download(key)` retrieves the same bytes
- [ ] FastAPI worker `s3_client.upload(key, bytes)` stores an object; `s3_client.download(key)` retrieves the same bytes
- [ ] Both services use the same bucket name (from env var) and the same key-naming convention (`uploads/<analysis_id>/<filename>`, `reports/<analysis_id>/report.pdf`)
- [ ] Missing `S3_BUCKET_NAME` or AWS credentials at startup causes a startup failure with a clear error message
- [ ] LocalStack integration test passes: upload → download → bytes match
- [ ] No AWS credentials in source code or committed config files

## Scope Boundaries

### In Scope

- AWS SDK v2 dependency in Spring Boot
- `boto3` dependency in FastAPI worker
- `StorageService` interface + S3 implementation in Spring Boot
- `s3_client` module in FastAPI worker
- LocalStack configuration for local development
- Key-naming convention documented in this spec

### Out of Scope

- Pre-signed URL generation for frontend-direct upload (ships with F-002-b Upload UI)
- Bucket policy and IAM role configuration (infrastructure setup)
- Actual analysis file uploads (ship with F-002-a Upload Substrate)
- Report PDF storage (ships with F-003 Analysis Pipeline)

## Constraints and Dependencies

- Blocked by: FS-001 (Spring Boot app shell), FS-002 (FastAPI worker app shell)
- AWS region TBD at infrastructure setup (env var placeholder is acceptable)
- SSE-AES256 is the encryption standard (CLAUDE.md Decision #3 context — architecture.md §Deployment)
- Both services must use the same bucket (enforced via shared `S3_BUCKET_NAME` env var)

## Key-Naming Convention

```
uploads/<analysis_id>/<original_filename>      # original uploaded sheet
reports/<analysis_id>/report.pdf               # generated report PDF
```

## Input Sources

- architecture.md §Components (AWS S3 row)
- architecture.md §Foundation Backlog (F-010)
- architecture.md §Data Flow (S3 interactions shown in sequence diagram)
- CLAUDE.md (SSE-AES256, S3 versioning — architecture decisions)

## Open Questions

## Revisions
