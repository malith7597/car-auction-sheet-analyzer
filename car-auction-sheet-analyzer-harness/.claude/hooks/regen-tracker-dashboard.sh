#!/usr/bin/env bash
#
# PostToolUse hook — Edit/Write/MultiEdit matcher.
# Keeps .forge/dashboard/{tracker.js, signals.js} in sync with the source of truth.
#
# Fires when ANY of the following are modified (because the dashboard's Signals
# section reads counts derived from these files, and the browser runs under
# file:// so it can't fetch them at render time):
#   - .forge/tracker.yaml                  → tracker.js
#   - .forge/specs/**/*.md                 → signals.js (rework rate, S4)
#   - .forge/plans/**/*.md                 → signals.js (rework rate, S4)
#   - .forge/lessons.md                    → signals.js (lessons cadence, S6)
#
# Contract:
#   - Exit 0 always; this hook never blocks.
#   - Fails open (one-line stderr note) if yq is missing.
#   - No-op if .forge/dashboard/ doesn't exist (project hasn't adopted the dashboard).
#   - Silent on success.
#
# Source: .forge/tracker.yaml + .forge/specs/**/*.md + .forge/plans/**/*.md + .forge/lessons.md
# Output: .forge/dashboard/tracker.js + .forge/dashboard/signals.js

set -u

file=$(jq -r '.tool_input.file_path // ""')
[ -z "$file" ] && exit 0

# Determine which artifact triggered, and which outputs to regenerate.
regen_tracker=0
regen_signals=0
case "$file" in
  *".forge/tracker.yaml")               regen_tracker=1; regen_signals=1 ;;
  *".forge/specs/"*.md)                 regen_signals=1 ;;
  *".forge/plans/"*.md)                 regen_signals=1 ;;
  *".forge/lessons.md")                 regen_signals=1 ;;
  *) exit 0 ;;
esac

tracker="$CLAUDE_PROJECT_DIR/.forge/tracker.yaml"
dashboard_dir="$CLAUDE_PROJECT_DIR/.forge/dashboard"

[ -f "$tracker" ]       || exit 0
[ -d "$dashboard_dir" ] || exit 0

# Support both yq variants:
#   mikefarah/yq (brew install yq)  — needs `-o=json` to emit JSON
#   kislyuk/yq  (pip install yq)    — jq wrapper; outputs JSON natively with identity filter
if yq --version 2>&1 | grep -q "mikefarah"; then
  yq_json() { yq -o=json . "$1"; }
else
  yq_json() { yq '.' "$1"; }
fi

if [ "$regen_tracker" = 1 ]; then
  if ! command -v yq >/dev/null 2>&1; then
    echo "Forge dashboard regen: yq missing; tracker.js not refreshed. Install mikefarah/yq ('brew install yq') or kislyuk/yq ('pip install yq')." >&2
  else
    {
      printf '/* Generated from ../tracker.yaml by hooks/regen-tracker-dashboard.sh. Do not edit. */\n'
      printf 'window.TRACKER = '
      yq_json "$tracker"
      printf ';\n'
    } > "$dashboard_dir/tracker.js"
  fi
fi

if [ "$regen_signals" = 1 ]; then
  # signals.js carries pre-computed inputs the browser can't compute under
  # file:// (it can't fetch sibling markdown). Schema:
  #
  #   window.SIGNALS = {
  #     generated_at: "<ISO>",
  #     rework: {
  #       specs: [ { file, revisions } ... ],   // count of "## Revisions" entries per file
  #       plans: [ { file, revisions } ... ]
  #     },
  #     lessons: {
  #       weekly: [ { week_start: "YYYY-MM-DD", count: N }, ... ]  // last 4 ISO weeks, newest last
  #     }
  #   }
  #
  # Revision counting heuristic: lines starting with `- ` immediately under
  # a `## Revisions` heading until the next `##` heading. Anything else under
  # Revisions (prose, sub-headings) is ignored. A spec/plan with no Revisions
  # heading counts as 0 — the convention is to add the heading at approval.

  count_revisions() {
    # $1 = file path
    awk '
      /^##[[:space:]]*Revisions([[:space:]]|$)/ { in_rev = 1; next }
      /^##/ { in_rev = 0 }
      in_rev && /^-[[:space:]]/ { n++ }
      END { print n + 0 }
    ' "$1"
  }

  # Build JSON arrays. Use python3 for safe JSON encoding (jq would also work
  # but is sometimes absent on minimal envs; python3 is on every macOS / linux).
  if command -v python3 >/dev/null 2>&1; then
    PROJECT_DIR="$CLAUDE_PROJECT_DIR" \
    python3 - <<'PY' > "$dashboard_dir/signals.js"
import json, os, re, sys
from datetime import datetime, timedelta, timezone

root = os.environ["PROJECT_DIR"]
forge = os.path.join(root, ".forge")

def count_revisions(path):
    # Each entry is one `### Rev N — YYYY-MM-DD` sub-heading under
    # `## Revisions` (the convention documented in .claude/rules/specs.md).
    # Bullets under each `### Rev N` are detail lines, not separate revisions.
    #
    # Exit-guard subtlety: must match "## " (h2 with trailing space) NOT plain
    # "##" — otherwise any `### Rev N` h3 sub-heading would terminate the
    # Revisions block, and we'd count 0 revs on every spec following the
    # documented convention.
    #
    # Legacy fallback: specs that predate the `### Rev N` convention sometimes
    # list revisions as plain bullets directly under `## Revisions`. If no h3
    # rev-headings exist in a file, fall back to counting bullets so those
    # files don't read as 0.
    try:
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return 0

    rev_heading_re = re.compile(r"^###\s+Rev\s+\d+\b", re.IGNORECASE)
    rev_count = 0
    bullet_count = 0
    in_rev = False
    for line in text.splitlines():
        if re.match(r"^##\s+Revisions(\s|$)", line):
            in_rev = True
            continue
        if in_rev and line.startswith("## "):
            in_rev = False
        if in_rev:
            if rev_heading_re.match(line):
                rev_count += 1
            elif re.match(r"^-\s", line):
                bullet_count += 1
    return rev_count if rev_count > 0 else bullet_count

def scan(dir_rel):
    out = []
    abs_dir = os.path.join(forge, dir_rel)
    if not os.path.isdir(abs_dir):
        return out
    for dirpath, _, filenames in os.walk(abs_dir):
        for name in filenames:
            if not name.endswith(".md"):
                continue
            # skip templates
            if name.startswith("_TEMPLATE"):
                continue
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, root)
            out.append({"file": rel, "revisions": count_revisions(full)})
    out.sort(key=lambda r: r["file"])
    return out

specs = scan("specs")
plans = scan("plans")

# Lessons cadence: count h3 headings of the form `### YYYY-MM-DD — title`
# within the last 4 ISO weeks. Week buckets keyed by ISO Monday.
#
# Back-compat: many engagements predate the dated-heading convention (they
# carry `## L-NNN — title` or similar undated headings). If we find zero
# dated headings, we fall back to counting *any* h2/h3 lesson-style heading
# and surface the result as `undated_total` so the dashboard's S6 tile can
# show "N total · undated" rather than going blank. Projects can migrate to
# the dated format later for weekly cadence to become available.
lessons_path = os.path.join(forge, "lessons.md")
dated_re   = re.compile(r"^###\s+(\d{4}-\d{2}-\d{2})\b")
undated_re = re.compile(r"^##+\s+([A-Za-z][\w-]*)\s+[—–-]\s")  # ## L-001 — title, ### Foo — bar, etc

# anchor "now" to the system clock at hook time; the browser does not need to
# recompute. last-4-weeks counts are relative to this snapshot.
now = datetime.now(timezone.utc).date()
monday = now - timedelta(days=now.weekday())
weeks = []
for i in range(4):
    start = monday - timedelta(weeks=(3 - i))
    weeks.append({"week_start": start.isoformat(), "count": 0})

undated_total = 0

if os.path.isfile(lessons_path):
    with open(lessons_path, "r", encoding="utf-8") as f:
        text = f.read()
    for line in text.splitlines():
        m = dated_re.match(line)
        if m:
            try:
                d = datetime.strptime(m.group(1), "%Y-%m-%d").date()
            except ValueError:
                continue
            entry_monday = d - timedelta(days=d.weekday())
            for w in weeks:
                if w["week_start"] == entry_monday.isoformat():
                    w["count"] += 1
                    break
    # Only count undated entries if no dated ones were found — mixed-format
    # files imply migration is in progress; trust the dated entries.
    if all(w["count"] == 0 for w in weeks):
        for line in text.splitlines():
            if dated_re.match(line):
                continue
            if undated_re.match(line):
                undated_total += 1

payload = {
    "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "rework": {"specs": specs, "plans": plans},
    "lessons": {"weekly": weeks, "undated_total": undated_total},
}

sys.stdout.write("/* Generated by hooks/regen-tracker-dashboard.sh. Do not edit. */\n")
sys.stdout.write("window.SIGNALS = ")
json.dump(payload, sys.stdout, indent=2)
sys.stdout.write(";\n")
PY
  else
    # No python3 — emit a minimal placeholder so the dashboard renders S4/S6
    # as "no data" instead of erroring.
    {
      printf '/* Generated by hooks/regen-tracker-dashboard.sh. Do not edit. */\n'
      printf 'window.SIGNALS = { "generated_at": null, "rework": { "specs": [], "plans": [] }, "lessons": { "weekly": [], "undated_total": 0 } };\n'
    } > "$dashboard_dir/signals.js"
    echo "Forge dashboard regen: python3 missing; signals.js emitted as empty placeholder." >&2
  fi
fi

exit 0
