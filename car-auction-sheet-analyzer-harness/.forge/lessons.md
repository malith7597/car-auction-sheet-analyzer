# Forge Lessons — [Project Name] Engagement → upstream sync log

> Lessons learned in this engagement that should flow back to `forge-harness` (template repo) so future engagements inherit them.
>
> **How to use this file when syncing upstream:**
> 1. Read each entry top-to-bottom.
> 2. For entries marked `Sync target: upstream`, port the change into the matching template file in `forge-harness/templates/project-harness/`.
> 3. Skip entries marked `Sync target: project-only` — they are project-specific and do not belong upstream.
> 4. For entries marked `Sync target: mixed`, see the entry's own breakdown — some parts go upstream, some stay.
> 5. After porting, mark the entry `Synced: <forge-harness commit>`.
>
> **Append new entries to the bottom.** Newest at bottom, in chronological order. One entry per coherent change (not one per commit — group commits that share a single lesson).
>
> ---

<!-- Example entry shape — delete after first real lesson lands. -->

## L-001 — Strict google_checks without an autoformatter is a recurring per-edit tax

- **Date:** 2026-06-17
- **Source commits in this repo:** FS-001 backend slice (PR #6, `df7d69e`); see `.forge/plans/foundation/001-app-shell-spring-boot-plan.md` § Notes
- **Sync target:** project-only (the resolution is a project toolchain choice; the *lesson* is worth carrying in mind upstream but there is no template file to port)
- **Synced:** n/a

### Problem observed

FS-001 adopted Checkstyle `google_checks` with `maxWarnings = 0` but **no autoformatter** (Spotless was explicitly rejected at plan review). Every hand-written Java file then had to satisfy google_checks' 2-space continuation-indent and line-length (100) rules by hand. This produced repeated check-fail → reformat loops across the slice (initial 41 violations, then trailing 1–2 LineLength violations even during the PR-review fix commit `59f43fe`). The cost is small per file but recurs on every edit and every reviewer round-trip.

### Change made

No tooling change yet — FS-001 absorbed the friction and established **2-space indentation for all backend Java** as the convention (recorded in the plan's implementation notes). A scoped `checkstyle-suppressions.xml` was added only for the Failsafe `*IT` abbreviation rule; production code stays fully strict.

### Lesson

If a project locks a strict style checker with `maxWarnings = 0`, pair it with an **autoformatter wired into the build/pre-commit** (Spotless, google-java-format) from the first slice — otherwise the team pays a manual reformat tax on every edit and burns reviewer rounds on indentation. If a formatter is deliberately declined, that decision should be revisited the moment the manual-fix loop shows up in practice (it did, in FS-001). Candidate resolutions for this engagement: adopt Spotless + google-java-format, or relax to a 4-space custom Checkstyle config. **Open for FS-012 (Build & CI) to decide.**
