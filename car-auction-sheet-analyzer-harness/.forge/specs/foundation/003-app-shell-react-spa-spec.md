# F-003 App Shell — React SPA

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Vite + React SPA boots with routing skeleton, GraphQL client wired to the Spring Boot API, and the development server running. This is the substrate for all React feature UI work.

## Requirements

### Functional Requirements
- `npm run dev` starts without errors
- Routing skeleton: at least `/`, `/login`, `/dashboard` routes defined (empty pages acceptable)
- GraphQL client configured (pointing at Spring Boot API)
- Environment config loaded (`VITE_API_URL`, etc.)
- Mobile-responsive layout wrapper (base CSS reset + viewport meta)

### Non-Functional Requirements
- Dev server hot-reloads on file change
- Production build (`npm run build`) completes without errors

## Acceptance Criteria
- [ ] `npm run dev` starts without errors on a clean checkout
- [ ] Navigating to `/` renders without a white screen or JS error
- [ ] GraphQL client sends a test query to the API (introspection or hello-world resolver)
- [ ] `npm run build` succeeds and produces a dist/ output

## Scope Boundaries

### In Scope
- Vite + React 18 project scaffold (TypeScript)
- React Router (or equivalent) routing skeleton
- Apollo Client or equivalent GraphQL client configured
- Base layout component (header placeholder, main content area, mobile-responsive)
- Environment variable loading (`import.meta.env`)
- Path aliases configured

### Out of Scope
- Design system primitives and tokens (F-011)
- Auth flow (product feature f-001)
- Any page content or business components

## Constraints and Dependencies
- Blocked by: none (can run in parallel with F-001, F-002)
- Repo: `<frontend-repo>` (does not exist yet)
- Vite + React 18 (CLAUDE.md Decision #9)
- GraphQL (CLAUDE.md Decision #8)

## Input Sources
- architecture.md §Components (React SPA row)
- architecture.md §Foundation Backlog (F-003)

## Open Questions

## Revisions
