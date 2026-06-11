# FS-012 Build & CI

> Status: draft
> Author: malith3
> Reviewed by:
> Date: 2026-06-01

## Context

All three repos (Spring Boot API, FastAPI worker, React SPA) need automated quality gates that run on every push. Without a working CI pipeline, broken builds accumulate silently and integration problems surface late. This slice wires lint, typecheck, tests, and build into GitHub Actions so every commit gets a green/red signal before merge.

## Requirements

### Functional Requirements

**Spring Boot API (Java/Maven):**
- `./mvnw verify` runs: compile → checkstyle (Google style) → unit tests → build JAR
- GitHub Actions workflow: runs `./mvnw verify` on push and PR to `main`
- Test coverage reported (JaCoCo, no minimum threshold at this stage — threshold ships per-feature)

**FastAPI worker (Python):**
- `make lint` runs ruff + black (check-only mode)
- `make test` runs pytest (hello-world test passes)
- `make build` packages the worker (Docker build or equivalent)
- GitHub Actions workflow: lint → test → build on push and PR to `main`

**React SPA (TypeScript/Vite):**
- `pnpm lint` runs ESLint with TypeScript rules
- `pnpm typecheck` runs `tsc --noEmit`
- `pnpm test` runs Vitest (hello-world component test passes)
- `pnpm build` produces a `dist/` output without errors
- GitHub Actions workflow: lint → typecheck → test → build on push and PR to `main`

**Shared:**
- All three workflows have a status badge in their repo READMEs
- PR checks required: merge to `main` blocked if any check fails (branch protection rule)
- No secrets hard-coded in workflow files — placeholders documented in repo README

### Non-Functional Requirements

- Full CI run (all three repos) completes in under 10 minutes
- Workflows use caching for Maven dependencies, pip packages, and pnpm store

## Acceptance Criteria

- [ ] `./mvnw verify` exits 0 on a clean Spring Boot checkout
- [ ] `make lint && make test && make build` exits 0 on a clean FastAPI checkout
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` exits 0 on a clean React checkout
- [ ] GitHub Actions workflow triggers on push to `main` and on PR targeting `main` for each repo
- [ ] A deliberate compile error causes the CI workflow to fail and block the PR
- [ ] CI run with cache warm completes in under 5 minutes per repo
- [ ] No hardcoded AWS credentials or tokens in workflow YAML files

## Scope Boundaries

### In Scope

- GitHub Actions workflow files for all three repos
- Lint, typecheck, unit test, and build steps per repo
- Dependency caching (Maven local repo, pip venv, pnpm store)
- Branch protection rule documentation (manual step — CI cannot configure GitHub itself)
- Status badge in each repo README

### Out of Scope

- Deploy step (ships with deployment infrastructure setup)
- E2E test step (ships with F-003 or later)
- Code coverage minimum thresholds (enforced per-feature)
- Security scanning / dependency audit (can be added as a follow-on slice)
- Multi-environment matrix (dev/staging/prod) — single build job for now

## Constraints and Dependencies

- Blocked by: FS-001, FS-002, FS-003 (all three app shells must exist for CI to have something to build)
- GitHub Actions (free tier for public repos; private repo minutes apply for private)
- Maven Wrapper (`mvnw`) must be committed to the backend repo
- Makefile must be committed to the worker repo
- `pnpm` lockfile must be committed to the frontend repo (no `npm` or `yarn`)

## Input Sources

- architecture.md §Deployment (CI/CD: GitHub Actions row)
- architecture.md §Foundation Backlog (F-012)
- architecture.md §Components (stack versions: Java 21, Python 3.11, React 18/Vite)

## Open Questions

## Revisions
