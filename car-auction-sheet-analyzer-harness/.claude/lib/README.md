# `.claude/lib/` — Shared Hook + Command Helpers

Sourceable shell helpers used by hooks and commands in this harness. Lives outside `hooks/` and `commands/` because helpers don't run on their own — they're sourced by the scripts that do.

## Convention

- Each helper is a single `.sh` file under `lib/`.
- Each helper defines one or more shell functions.
- Each helper is also executable directly for a `--self-test` mode (or other operator-facing modes).
- Each helper uses the `BASH_SOURCE[0] = $0` check to differentiate sourced-mode from invoked-mode.
- Helpers are `set -u`-safe: every variable expansion uses `${var:-}` or guards against unset state.
- Helpers return `n/a` (or another sentinel) on missing inputs rather than `exit`-ing — let the caller decide what to do.

## Current helpers

| File | Function | Used by |
|------|----------|---------|
| [`derive-phase.sh`](derive-phase.sh) | `derive_phase <harness-root>` → `discovery \| architecture \| foundation \| engineering \| n/a` | `.claude/hooks/phase-scope-skills.sh`, `.claude/hooks/track-token-usage.sh` (planned) |
| [`forge-statusline-segment.sh`](forge-statusline-segment.sh) | `forge_statusline_segment <statusLine-stdin-json>` → one-line Forge segment, or empty when outside a harness | Developer's personal status-line script (direct-invoke mode) — see [`../hooks/README.md`](../hooks/README.md) §Status line segment |

## Adding a new helper

1. Create `<name>.sh` with a function `<function_name>` and a `--self-test` mode.
2. Document signature, return value, and failure modes at the top of the file.
3. Add a row to the table above.
4. Source from the caller using leading-dot + space:
   ```bash
   . "$PROJECT_DIR/.claude/lib/<name>.sh"
   result=$(<function_name> "$arg")
   ```

## Why a separate directory

Hooks (`.claude/hooks/`) are scripts that Claude Code invokes on its own. Commands (`.claude/commands/`) are markdown files Claude reads when the user types `/<name>`. Neither is the right home for a function that runs only when sourced by another script. `lib/` is the natural separation, and keeps the `hooks/` README focused on what actually runs.

## Self-test discipline

Every helper exposes `--self-test`. Run it after any change:

```bash
./.claude/lib/derive-phase.sh --self-test
```

The test suite must pass before the helper is considered shippable. Self-test failures are CI-level severity: the helper's contract changed and downstream hooks may break.
