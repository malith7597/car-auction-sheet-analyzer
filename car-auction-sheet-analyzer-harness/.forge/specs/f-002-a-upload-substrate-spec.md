# F-002-a Upload Substrate — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Substrate sibling of F-002 (substrate-cut). Creates the Analysis entity in PostgreSQL, stores the uploaded sheet in AWS S3, and triggers credit deduction via F-007-a. F-003 (Analysis Pipeline) depends on this substrate to exist before it can enqueue a job.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Analysis entity DDL + migration (status: uploaded)
- S3 file storage endpoint (PDF and image formats up to 20 MB, AES-256)
- MIME type validation (sniffing, not extension)
- Credit deduction via F-007-a service on upload initiation
- Re-upload support for rejected/poor-quality sheets

### Out of Scope
- Upload UI / React component (F-002-b)
- Pipeline execution (F-003)

## Constraints and Dependencies
- Blocked by: F-001 (auth), F-007-a (credit deduction service must exist)
- Substrate piece of F-002 substrate-cut — F-002-b depends on this
- F-003 depends on this (schema-only consumer)

## Input Sources
- PRD §Functional Surface > Auction Sheet Upload
- SRS §5 FR-002, §7 System Architecture, §28 Deployment Architecture

## Open Questions

## Revisions
