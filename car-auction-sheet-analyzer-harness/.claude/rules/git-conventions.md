---
description: Git branch naming, commit format, PR conventions, and worktree commands
globs: **/*
---

# Git Conventions

## Branching — GitHub Flow

```
main                                    # Production-ready. Always deployable. Protected. Never commit directly.
feature/<ticket>-<short-description>    # All work — branches from main, merges back to main via PR
fix/<ticket>-<short-description>        # Bugfix work — same merge model as feature
hotfix/<ticket>-<short-description>     # Urgent prod fixes — same merge model
```

Rules:
- `main` is the only long-lived branch — no `develop`, no release branches
- Every piece of work (feature, fix, chore) gets its own branch from `main`
- Branches are short-lived — open a PR early, merge as soon as it passes review and checks
- `main` must always be in a deployable state

## Commit Format

`<type>: <description>`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Rules:
- Imperative present tense ("add", not "added")
- Subject line under 72 characters
- No period at the end of the subject line
- Reference ticket in body when relevant: `Refs: <ticket>`

## Pull Requests

Every PR must include:
- PR title matches commit convention (`<type>: <description>`)
- Link to the spec file in `.forge/specs/`
- Link to the plan file in `.forge/plans/`
- Summary of what was built and any plan deviations
- Test evidence — screenshots or test output for UI/critical paths

## Worktree Commands

Worktrees branch from `main`. Run from the workspace parent directory.

### Creation

```bash
git -C <repo> worktree add -b feature/<ticket>-<description> worktrees/<ticket>/<repo> main
```

Multi-repo (one worktree per repo, branch coordinated):
```bash
git -C <backend-repo> worktree add -b feature/<ticket>-<description> worktrees/<ticket>/<backend-repo> main
git -C <frontend-repo> worktree add -b feature/<ticket>-<description> worktrees/<ticket>/<frontend-repo> main
```

### Cleanup (after merge)

```bash
git -C <repo> worktree remove worktrees/<ticket>/<repo>
rmdir worktrees/<ticket>
```
