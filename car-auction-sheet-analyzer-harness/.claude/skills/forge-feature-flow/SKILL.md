---
name: forge-feature-flow
phases: [engineering]
description: "Front door for delivering a feature end-to-end. Use when someone wants to START, SPEC, BUILD, or SHIP a feature/ticket and asks what the steps are — e.g. 'I want to start ULC-014', 'how do I spec this feature', 'what's the flow to build X', 'begin work on <ticket>'. Routes to the single orchestrator command `/forge-deliver <ticket>`, which sequences spec authoring → review → decomposition → planning → implementation → wave shipping → reflect with the gates and human checkpoints. Do NOT enumerate or hand-run the individual sub-skills (forge-gap-check, forge-spec-author, forge-spec-review, forge-wave-decompose, forge-plan-author, …) one-by-one — the orchestrator invokes them in order. If a ticket id is given, hand off to /forge-deliver <ticket>; if not, ask for it."
---

# /forge-feature-flow

Front door to the feature-delivery orchestrator. This skill does **no work itself** — it routes to `/forge-deliver`, the one command that drives a feature from backlog to done. It exists so that "how do I start feature X?" surfaces the orchestrator instead of a list of sub-skills to run by hand.

## What to do

1. **Determine the ticket.**
   - If a ticket id was supplied (e.g. `/forge-feature-flow ULC-014`, or the user named one), use it.
   - If not, ask: *"Which feature/ticket do you want to deliver? (e.g. ULC-014)"* and wait.

2. **Route to the orchestrator.**
   - **Explicit invocation with a ticket** (user typed the slash command with an id, or clearly asked to start it) → run `/forge-deliver <ticket>` now.
   - **Inferred intent** (you auto-triggered off a fuzzy natural-language ask) → recommend and confirm first: *"The whole flow runs through one command: `/forge-deliver <ticket>` — it sequences spec → review → decompose → plan → implement → ship → reflect with the gates. Run it now?"* — then run on confirmation. `/forge-deliver` dispatches agents and opens PRs, so don't launch it silently off an inferred ask.

## Rules

- **Delegate, never duplicate.** Do not reproduce the orchestrator's steps here. `/forge-deliver` owns the procedure; this skill only points at it.
- **Don't hand-run the sub-skills.** `forge-gap-check`, `forge-spec-author`, `forge-spec-review`, `forge-wave-decompose`, `forge-plan-author`, `forge-test-verify`, etc. are sequenced *by* `/forge-deliver` with its gates and human checkpoints. Listing them as manual steps is the exact anti-pattern this skill exists to prevent.
- **One door, same room.** `/forge-deliver <ticket>`, `/forge-feature-flow <ticket>`, and "how do I start `<ticket>`?" all lead to the same place.
