# F-002-b Upload UI — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Surface sibling of F-002 (substrate-cut). React upload component that allows authenticated users to upload an auction sheet, see upload progress and thumbnail preview, and receive feedback on validation errors. Calls the F-002-a upload endpoint.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- React upload component (drag-and-drop + file picker)
- Upload progress indicator
- Thumbnail preview on successful upload
- MIME validation error feedback
- Re-upload trigger on failure or poor quality
- Credit balance shown pre-upload (informs user before deduction)

### Out of Scope
- Upload endpoint / S3 storage (F-002-a)
- Pipeline execution or status polling (F-003, F-006)

## Constraints and Dependencies
- Blocked by: F-001 (auth), F-002-a (upload endpoint must exist)
- Surface piece of F-002 substrate-cut

## Input Sources
- PRD §Functional Surface > Auction Sheet Upload
- SRS §5 FR-002, §18 Frontend Module Design

## Open Questions

## Revisions
