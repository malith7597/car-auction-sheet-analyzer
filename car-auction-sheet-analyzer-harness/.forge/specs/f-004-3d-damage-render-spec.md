# F-004 3D Damage Render — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Calls the mesh.ai API with damage location/type data from F-003's damage interpretation output, retrieves a 3D vehicle render with damage markers overlaid, and stores the render asset in S3 for use in the F-005 report. Runs as a pipeline stage within the FastAPI worker, recorded as a PipelineStep.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Format damage markers from F-003 output into mesh.ai API request payload
- Call mesh.ai API (premium subscription required — SP-ARCH-002)
- Store 3D render asset in S3
- Link render asset URL to Analysis record
- Record PipelineStep for this stage (status, confidence, timing)
- Handle mesh.ai API failure gracefully (mark stage failed, retain PipelineStep logs)

### Out of Scope
- Report rendering of the 3D asset (F-005)
- Fallback to 2D diagram if mesh.ai unavailable (Phase 2 concern)

## Constraints and Dependencies
- Blocked by: F-003 (damage interpretation output must exist)
- mesh.ai API — premium subscription required; capability validation needed (SP-ARCH-002)
- Alternative 3D render providers to be evaluated in future phases (architecture.md §In-House-First Audit)

## Input Sources
- PRD §Functional Surface > Vehicle Intelligence Report (3D Damage Visualisation)
- SRS §31 3D Rendering Strategy, §32 Vehicle Damage Mapping Logic
- architecture.md §Build Feasibility (SP-ARCH-002)

## Open Questions

## Revisions
