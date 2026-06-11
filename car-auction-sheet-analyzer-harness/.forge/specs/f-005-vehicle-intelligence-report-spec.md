# F-005 Vehicle Intelligence Report — Spec

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Assembles the completed pipeline output (F-003 extracted fields + F-004 3D render) into a structured vehicle intelligence report, stores it in MongoDB, generates a PDF, and delivers it to the user via an in-browser viewer with download and sharing capabilities. Kept as one feature: single report delivery surface.

## Requirements

### Functional Requirements

### Non-Functional Requirements

## Acceptance Criteria
- [ ]

## Scope Boundaries

### In Scope
- Report assembly from all pipeline stage outputs
- Report entity DDL (MongoDB document schema)
- In-browser report viewer (React): Vehicle Summary, Translated Inspector Notes, 3D Damage Visualisation, Damage Detail Table, Equipment List, Buyer Summary (Critical Issues / Genuine Strengths / Recommended Next Steps)
- PDF generation and download
- Report visibility toggle (private / public link)
- Public share link generation (token-based)

### Out of Scope
- Pipeline execution (F-003, F-004)
- Analysis history list (F-006)

## Constraints and Dependencies
- Blocked by: F-003 (pipeline output), F-004 (3D render asset)
- Report content stored in MongoDB (CLAUDE.md Decision #3)
- Report PDF stored in AWS S3

## Input Sources
- PRD §Functional Surface > Vehicle Intelligence Report
- SRS §5 FR-007–FR-011, §33 Export & Reporting Module
- JP Sheet competitor screenshots (discovery) — target report shape

## Open Questions

## Revisions
