# [Project Name] — Quality Checklist

> What "checked" means on this project.

## Mandatory Gates (every task, no exceptions)

- [ ] **Spec review** — requirements approved before planning starts
- [ ] **Plan review** — implementation approach approved before coding begins
- [ ] **Check** — lint, tests, and build pass (run via project's existing commands; dedicated `/forge-check` TBD)
- [ ] **Diff review** — implementation verified against spec and plan
- [ ] **Reflect** — answer: what worked, what didn't, what should be updated in the framework

## Recommended Gates (use when applicable, skip with justification)

- [ ] **Security/vulnerability scan** — recommended for auth, data handling, API endpoints
- [ ] **Adversarial code review** (dedicated command TBD; currently via direct conversation with Claude or `/council`) — recommended for complex features, architectural patterns
- [ ] **Browser QA** — recommended for user-facing UI work
