# F-005 Data Layer — MongoDB

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
MongoDB connection established in the Python FastAPI worker and a base repository class available for Report documents. No document schemas yet — those ship with F-005 (Vehicle Intelligence Report).

## Requirements

### Functional Requirements
- FastAPI worker connects to MongoDB on startup
- Base repository class provides: insert, find_by_id, update, delete operations
- Connection failure logs a clear error and causes worker startup to fail

### Non-Functional Requirements
- Connection pool configured appropriately for worker load

## Acceptance Criteria
- [ ] FastAPI worker starts and logs successful MongoDB connection
- [ ] Base repository `insert` and `find_by_id` smoke tests pass against an empty DB

## Scope Boundaries

### In Scope
- MongoDB 7 / Motor (async driver) client configuration
- Base `DocumentRepository` class with CRUD primitives
- Connection URI loaded from environment config
- Test database config for unit tests (mongomock or similar)

### Out of Scope
- Report document schema (ships with product feature f-005)
- Any collection creation or indexing (those ship with the feature that owns the document)

## Constraints and Dependencies
- Blocked by: F-002 (FastAPI worker must be running)
- MongoDB hosting TBD — OQ-5 (AWS DocumentDB vs MongoDB Atlas)
- MongoDB 7, Motor async driver (architecture.md §Components)

## Input Sources
- architecture.md §Components (MongoDB row)
- architecture.md §Foundation Backlog (F-005)

## Open Questions

## Revisions
