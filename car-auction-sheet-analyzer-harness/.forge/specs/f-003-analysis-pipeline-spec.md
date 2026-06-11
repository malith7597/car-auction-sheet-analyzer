# F-003 Analysis Pipeline — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Core AI processing engine. Spring Boot enqueues the Analysis job to AWS SQS; the Python FastAPI worker consumes it and runs the 5-stage pipeline: OCR → Translation → Extraction → Damage Interpretation → (Report Generation handed to F-005). Each stage records a PipelineStep with input, output, status, confidence scores, and timing. Kept as one feature: single processing envelope in the FastAPI worker service.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- SQS job production (Spring Boot) on Analysis creation
- SQS job consumption (FastAPI worker)
- OCR stage: PaddleOCR, auto-deskew ±15°, per-field confidence scores, flag < 0.75
- Translation stage: LLM provider (TBD — OQ-2), domain glossary 500+ terms, ambiguity flagging
- Structured extraction stage: all canonical field groups (identity, dates, specs, condition, appearance, dimensions, assessment)
- Damage interpretation stage: location codes A1–F, damage type codes S/D/W/C/X/XX/U/E/P/B → plain-English
- PipelineStep entity DDL + migration
- Analysis status transitions: uploaded → ocr_processing → translation_processing → extraction_processing → report_generating → completed / failed / needs_review / intervention
- Pipeline intervention: Technical Admin and Super Admin can edit step output and resume from any step (gRPC call from Spring Boot to FastAPI)

### Out of Scope
- 3D render step (F-004)
- Report assembly/delivery (F-005)
- Credit deduction (F-002-a)

## Constraints and Dependencies
- Blocked by: F-002-a (Analysis entity + S3 file must exist)
- LLM provider TBD — OQ-2 blocks final implementation choice
- Async pipeline via AWS SQS (CLAUDE.md Decision #1)
- Spring Boot ↔ FastAPI via gRPC for intervention (CLAUDE.md Decision #6)
- Pipeline worker in Python FastAPI (CLAUDE.md Decision #2)

## Input Sources
- PRD §Functional Surface > Analysis Pipeline
- SRS §5 FR-003–FR-006, §8 AI Pipeline Architecture, §9 OCR Pipeline, §10 Translation Pipeline
- architecture.md §Build Feasibility (SP-ARCH-001)

## Open Questions

## Revisions
