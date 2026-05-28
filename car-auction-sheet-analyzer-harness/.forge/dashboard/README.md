# Tracker dashboard

A self-contained, double-clickable HTML view of `.forge/tracker.yaml`. Reads from
sibling files (`tracker.js`, `signals.js`, optionally `usage.js`) that mirror
project state as `window.TRACKER` / `window.SIGNALS` / `window.USAGE`. No web
server, no build step.

## Files

| File | Contents | Source | Refresh |
|------|----------|--------|---------|
| `index.html` | Main dashboard — hero, KPI strip, setup gates, **tabbed delivery phases**, signals tiles, conditional usage line, recent activity rail. | hand-edited | n/a |
| `usage.html` | Per-phase / per-day / per-developer / per-model token-usage breakdown. Linked from the index Usage section when local usage data exists. | hand-edited | n/a |
| `tracker.js`  | `window.TRACKER` = JSON mirror of `tracker.yaml`. | `.forge/tracker.yaml` (via `yq`) | `regen-tracker-dashboard.sh` hook |
| `signals.js`  | `window.SIGNALS` = precomputed inputs for the S4 (rework rate) and S6 (lessons cadence) signal tiles. | `.forge/specs/**/*.md` + `.forge/plans/**/*.md` + `.forge/lessons.md` | `regen-tracker-dashboard.sh` hook |
| `usage.js`    | `window.USAGE` = aggregated token-usage data for this project. **Gitignored** (per-developer-per-machine). | `~/.claude/forge-usage.jsonl` (filtered by current project) | `regen-usage-dashboard.sh` hook |

## View

Double-click `index.html`. It opens in your default browser via `file://`. All
three data files are loaded via regular `<script>` tags (no `fetch()`, which is
blocked under `file://`). Missing data files are handled gracefully: tracker
absent → full-page fallback; signals absent → S4/S6 read as placeholders; usage
absent → the Usage section doesn't render at all.

## Refresh

**Automatic.** Two `PostToolUse` hooks keep the data files in sync:

- `.claude/hooks/regen-tracker-dashboard.sh` — regenerates `tracker.js` when
  `.forge/tracker.yaml` is edited, and regenerates `signals.js` when any of
  `.forge/specs/**/*.md`, `.forge/plans/**/*.md`, or `.forge/lessons.md` are
  edited (tracker.yaml edits trigger both).
- `.claude/hooks/regen-usage-dashboard.sh` — regenerates `usage.js` on every
  Claude Code Stop event in this project.

After Claude edits any of those source files, just refresh the browser tab.

**Manual fallback** for `tracker.js` (e.g., after a hand-edit outside Claude):

```bash
cd .forge/dashboard
{ printf 'window.TRACKER = '; yq -o=json . ../tracker.yaml; printf ';\n'; } > tracker.js
```

`yq` is already required by the harness gate-state hooks — install with
`brew install yq` (macOS) if needed. Without `yq` the hook fails open with a
one-line stderr note; `tracker.js` will go stale until you install it or run
the manual command.

The dashboard never edits `tracker.yaml`, spec/plan files, or `lessons.md` —
it's a read-only view.

## What the dashboard shows

### Hero
The project name, a one-line **status string** answering "where is the current
phase?" (one of 10 conditions in the spec, derived from `setup.*` +
`delivery.current_phase` + `delivery.phases`), and a secondary line with open
risks, blocked features, and last-updated relative time (suppressed when all
zero).

### At-a-glance
Four KPI tiles — **Total features**, **Shipped**, **In flight**, **Remaining**
— plus a project-wide **overall progress bar** (shipped ÷ total). All four
values come from `tracker.yaml` alone, so the strip renders whether or not
local usage data exists.

### Setup
A four-dot row (PRD → Architecture → Foundation → Decomposition) with labels
and gate-pass dates. Foundation slices collapse behind a disclosure. When all
four gates pass and foundation is done, the section collapses to a one-line
`✓ Setup complete · sealed YYYY-MM-DD` summary with the dot row still visible
and the labels behind a disclosure.

### Delivery
Two render modes, decided by `delivery.phases.length`:

- **Phased mode** (`delivery.phases` non-empty): **tabbed phase strip**. Each
  tab shows the phase number, title, status pill, mini progress bar, and
  done/total count. Click a tab to view its detail panel. The active tab is
  the in-progress phase by default; selection persists in
  `localStorage` under `forge-tracker-phase-state`. Locked-phase panels show
  feature-title preview pills; in-progress and complete panels show feature
  rows with gate dots (G1/G2/G3/G4 derived from each feature's sub-status)
  sorted by sub-status priority. Data drift (a `complete` phase missing
  `sealed`, or a feature whose `delivery_phase` doesn't match any phase id)
  surfaces inline with a ⚠ on the affected tab/row.
- **Flat mode** (`delivery.phases: []`): one-row-per-feature list grouped by
  sub-status, sorted by `last_updated`. No phase scaffolding. Used by small
  projects that opt out of phases (under ~10 features).

There is no "Attention" section — paused / blocked / drift surface inline on
the feature rows they describe. Accepted risks live in `project-prd.md`;
scoped spikes live in `design/architecture.md`.

### Signals (the new section)
Six leading-indicator tiles that surface harness-effectiveness over time. Each
tile is a single number + sub-label; no bordered cards.

| ID | Question | Source |
|----|----------|--------|
| **S1 Phase throughput** | How many features did we ship in the current phase, and how many are in flight? | `tracker.yaml` features grouped by `delivery_phase` + sub-status |
| **S2 Phase pace** | Are we on pace, given how long previous phases took? | `delivery.phases[].started` + `sealed` (median of completed phases) |
| **S3 Lead time** | How long does a feature take, end to end? | Feature `started` → `last_updated` for `phase: done`; median + p75 + last-4-week trend |
| **S4 Rework rate** | Are specs/plans landing on the first try? | `## Revisions` entry counts parsed from `.forge/specs/**/*.md` + `.forge/plans/**/*.md` (precomputed into `signals.js`) |
| **S5 Paused / dropped** | What share of decomposed features stopped before shipping? | Count of features with `phase: paused` or `dropped`, over decomposed total |
| **S6 Lessons cadence** | Is the team still in heavy learning mode, or has the workflow stabilized? | Weekly count of `### YYYY-MM-DD — title` headings in `.forge/lessons.md` over last 4 weeks (sparkline) |

**Reading the signals.** These establish a baseline and surface direction —
they do not (and cannot, in v1) prove the harness improved productivity. A
non-harness comparison point doesn't exist inside this dashboard. Lessons
cadence dropping over time is **good** (stabilization). Rework rate dropping
is good; rising can be either thrashing (bad) or higher-quality specs
catching more issues earlier (good) — needs human read of which. Phase pace
is wall-clock, not effort.

**Pricing never appears in the Signals section.** Pricing is a local-data
feature (depends on per-developer `usage.jsonl`), and the rest of the
dashboard renders correctly without it — see Usage below.

### Usage (conditional)
A one-line current-week summary — **tokens this week · est. cost · link to
`usage.html`** — that renders **only** when `window.USAGE` has at least one
row scoped to the current project. When local usage data is absent, the
entire Usage section is hidden; no empty card, no placeholder, no "0
tokens" line. The full per-phase / per-day / per-developer / per-model
breakdown lives in **`usage.html`** (the link target), which reuses the same
`usage.js` data and rate table.

**Pricing appears only in the Usage section and `usage.html`.** Currency
values do not appear in the hero, KPI strip, signals, or activity rail
(FR-11 invariant — grep the rendered DOM for `$` and you'll see this).

### Recent activity
The 5 most recent events derived from tracker timestamps (phase
sealing/opening, feature last-updated transitions, gate runs). Listed
newest-first with relative timestamps.

## Privacy

`usage.js` and the underlying `.forge/usage.jsonl` are **gitignored** — they
contain `user_email` values from `git config user.email` and are
per-developer-per-machine local state. The other three data files
(`tracker.js`, `signals.js`, plus the source `tracker.yaml`) carry no
per-developer fields and are safe to commit.

For team-wide rollup across developers, Phase 2 of the token-usage spec
(`docs/engineering/specs/2026-05-14-token-usage-tracking.md`) ships data to
a shared sink — not part of v1.

## Updating Anthropic API rates

When Anthropic changes API prices, edit the `RATES` block (and the
`RATES_VERIFIED_DATE` constant) in **two places**, identically:

1. The inline script in `index.html` (used by the Usage one-line summary).
2. The inline script in `usage.html` (used by the cost card + by-model
   breakdown).

Existing rows in `~/.claude/forge-usage.jsonl` need no migration — cost is
computed at render time, not at capture time. The dashboards apply the new
rates to all history on the next refresh.

## Customising

Templates ship generic. To rebrand for your project, edit `index.html`:

- The Forge mark (inline SVG in the header)
- Colors (CSS custom properties in the `:root` block at the top)
- Section titles ("Setup", "Delivery", "Signals", etc.)

`tracker.js`, `signals.js`, and `usage.js` are generated — do not hand-edit.
