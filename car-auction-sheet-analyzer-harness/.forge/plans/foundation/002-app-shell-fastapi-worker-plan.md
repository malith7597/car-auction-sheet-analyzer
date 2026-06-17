# FS-002 App Shell — FastAPI Worker — Plan

> Spec: `.forge/specs/foundation/002-app-shell-fastapi-worker-spec.md`
> Status: approved
> Author: malith3
> Reviewed by: malith3 (lead)
> Date: 2026-06-17 (drafted) · 2026-06-17 (approved after single-pass review)
> Reviewed-via: /forge-plan-review (single-pass, 2026-06-17)

## Approach

Scaffold a new Python 3.11 / FastAPI worker into a **new `car-auction-sheet-worker/`
subdirectory** of the existing `car-auction-sheet-analyzer` monorepo (same layout as
`car-auction-sheet-backend/` and `car-auction-sheet-frontend/` — one git repo rooted at the
parent). Unlike FS-001's backend, the worker dir has **no pre-existing `CLAUDE.md` Stack
Profile**, so this slice *establishes* the Python worker conventions (package layout, config
contract, logging, testing, lint/format tooling) that every later worker slice (FS-005,
FS-006, FS-007, F-003/004) inherits — the Python analog of what FS-001 did for the backend.

The slice proves five things, mirroring FS-001's shape on the Python side:
1. A runnable FastAPI app (`uvicorn`) with a public `GET /health` → `{"status":"ok"}`.
2. **Fail-fast config validation** naming the missing variable on boot (pydantic-settings),
   the Python mirror of FS-001's `RequiredEnvironmentValidator`.
3. A **boto3 SQS consumer loop** that polls, dispatches to a handler, and deletes on success.
4. A **hello-world job handler** proving the consume→process→ack path end to end.
5. A **LocalStack SQS substrate via `docker-compose`** (main queue + DLQ with a redrive
   policy, `maxReceiveCount = 3`) — the local-dev + integration-test substrate, the Python
   analog of FS-001's docker-compose Postgres.

**Scope boundary (load-bearing):** the hello-world round-trip in this slice is
**self-contained** — a test/dev producer (boto3) enqueues directly onto the LocalStack queue
and the worker consumes it. The **Spring Boot → worker** cross-service round-trip belongs to
**FS-006 (Message queue wiring)**, not here (architecture.md §Foundation Backlog F-006).
FS-002 must not depend on the Spring Boot producer existing.

**Applying lesson L-001** (strict checker without a formatter is a per-edit tax, from FS-001):
the worker pairs its linter **with** a formatter from the first commit — **Ruff** does both
(lint + format), plus **mypy** for type checking. No hand-maintained style rules.

Integration tests use **testcontainers-localstack** (ephemeral, CI-portable) and are kept in
a **separate pytest marker/path** from unit tests, so Docker-less CI stays green until FS-012
wires Docker into CI — exactly the `test` vs `integrationTest` split FS-001 established.

## Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | New `car-auction-sheet-worker/` **subdirectory** in the monorepo (not a separate GitHub repo) | The workspace is a single git repo rooted at the parent; backend + frontend are already subdirs. Matches the established layout (spec Constraints). |
| 2 | **Python 3.11**, **FastAPI** + **uvicorn**, package root `app/` with `app/{handlers,sqs,config,logging}` modules | Python 3.11 + FastAPI per CLAUDE.md Decision #2. A small module layout the pipeline slices (OCR/LLM/mesh.ai) extend. |
| 3 | Dependency + venv management via **`uv`** (`pyproject.toml` + `uv.lock`) | Fast, reproducible, lockfile-pinned (the `gradlew`-wrapper analog). **Flag for plan review:** confirm `uv` vs Poetry — first Python-tooling choice for the engagement. |
| 4 | Config via **pydantic-settings** `Settings` model; **fail-fast** at startup raising `MissingConfigError` naming the first missing/blank required var | Python mirror of FS-001's env contract (AC: missing var fails fast, named). pydantic-settings gives typed env loading + validation in one place. |
| 5 | Required config contract: `AWS_REGION`, `SQS_QUEUE_URL`, `SQS_DLQ_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL` (LocalStack override, optional in prod) | Minimal set to boot + consume. MongoDB URI is **deferred to FS-005** (out of scope here) despite the spec's illustrative "etc." — keeping the required set to what this slice actually uses. |
| 6 | **boto3** SQS client; consumer loop: long-poll (`WaitTimeSeconds=20`), dispatch to handler, `DeleteMessage` on success, leave on the queue on failure (redrive policy handles DLQ) | boto3 is the standard AWS SDK; relying on SQS redrive (not app-side retry counting) keeps the worker simple and matches the DLQ-after-3 AC. |
| 7 | DLQ wiring is **queue-side**: LocalStack init provisions main queue + DLQ with `RedrivePolicy {maxReceiveCount: 3}` | Spec OQ-FS002-1 resolved = 3. Redrive is an SQS feature; the worker doesn't count retries itself. |
| 8 | Lint+format = **Ruff** (`ruff check` + `ruff format`); types = **mypy**; all wired into a `make check` / `uv run` entrypoint | Directly applies **L-001** — pair the checker with a formatter from day one. Ruff replaces flake8+black+isort in one fast tool. |
| 9 | Tests = **pytest** (+ `pytest-asyncio`); unit mock the boto3 client; integration use **testcontainers-localstack**, marked `@pytest.mark.integration` and excluded from the default `pytest` run | Mirrors FS-001's unit/`*Test` vs integration/`*IT` split; Docker-less CI stays green until FS-012. |
| 10 | `docker-compose.yml` ships a **LocalStack** service (SQS only) + an init script provisioning the queue + DLQ | Lets `uvicorn` + a dev producer run on a clean checkout (spec ACs) without real AWS. The FS-001 docker-compose-Postgres analog. |
| 11 | This slice authors the worker **`CLAUDE.md` Stack Profile** + `README.md` + `.env.example`, and adds the worker row to the harness `CLAUDE.md` Reference Map | The worker dir has no profile yet; later slices need the conventions documented up front (FS-001 subtask-7 analog, but authoring rather than reconciling). |

## Subtasks

### 1. Python + FastAPI scaffold, tooling, `/health`
- **What:** Initialize `car-auction-sheet-worker/` with `uv` (`pyproject.toml`, `uv.lock`),
  Ruff + mypy config, the `app/` package, a FastAPI app exposing `GET /health` →
  `{"status":"ok"}`, and `app/log_config.py` (basic JSON logger; full wiring FS-013 — named
  `log_config`, not `logging`, to avoid shadowing the stdlib module). `uvicorn app.main:app`
  boots clean.
- **Files:** `pyproject.toml`, `uv.lock`, `app/__init__.py`, `app/main.py`,
  `app/log_config.py`, `.gitignore`, `.dockerignore`, `ruff.toml` (or `[tool.ruff]` in pyproject)
- **Pattern:** standard FastAPI app-factory; mirrors FS-001 subtask 1 (scaffold + boot).

### 2. Config loading + fail-fast validation (named)
- **What:** `app/config.py` — a pydantic-settings `Settings` model over the required
  contract (Decision #5); a `load_settings()` that raises `MissingConfigError` naming the
  first missing/blank var, invoked at app startup **before** the consumer starts.
- **Files:** `app/config.py`, `app/errors.py` (`MissingConfigError`)
- **Pattern:** new — Python mirror of FS-001's `RequiredEnvironmentValidator`; establishes
  the worker env-contract pattern. Never logs the value, only the name.

### 3. SQS consumer loop (boto3)
- **What:** `app/sqs/consumer.py` — a `Consumer` that long-polls `SQS_QUEUE_URL`, dispatches
  each message to a registered handler, `DeleteMessage` on success, leaves it on failure
  (redrive → DLQ). Graceful shutdown on SIGTERM. Started from `app/main.py` lifespan (or a
  `worker` entrypoint) after config validation passes.
- **Files:** `app/sqs/__init__.py`, `app/sqs/consumer.py`, `app/sqs/client.py` (boto3 client
  factory honoring `AWS_ENDPOINT_URL` for LocalStack)
- **Pattern:** new — the consume loop every pipeline slice plugs handlers into.

### 4. Hello-world job handler
- **What:** `app/handlers/hello_world.py` — a handler that parses the hello-world payload,
  logs it, and returns success (proves consume→process→ack). Registered with the consumer.
- **Files:** `app/handlers/__init__.py`, `app/handlers/hello_world.py`
- **Pattern:** new — the handler-registration shape later pipeline steps follow.

### 5. LocalStack docker-compose + queue/DLQ provisioning
- **What:** `docker-compose.yml` with a LocalStack (SQS) service; `scripts/init-localstack.sh`
  (run via LocalStack init hook) provisioning the main queue + DLQ with
  `RedrivePolicy {maxReceiveCount: 3}`. A short `scripts/send-hello.py` dev producer to
  enqueue a hello-world message locally.
- **Files:** `docker-compose.yml`, `scripts/init-localstack.sh`, `scripts/send-hello.py`
- **Pattern:** FS-001 `docker-compose.yml` (Postgres) analog.

### 6. Tests — T1 unit + T2 LocalStack integration
- **What:** T1: `test_health.py` (FastAPI `TestClient` — `/health`, no Docker),
  `test_config.py` (passes when all set; raises named error per missing var),
  `test_hello_world.py` (handler logic). T2: `test_consumer_it.py` against
  testcontainers-localstack — (a) enqueue → worker consumes + deletes; (b) a handler that
  always fails → message lands on DLQ after `maxReceiveCount = 3`.
- **Files:** `tests/__init__.py`, `tests/conftest.py`, `tests/unit/test_health.py`,
  `tests/unit/test_config.py`, `tests/unit/test_hello_world.py`,
  `tests/integration/test_consumer_it.py`
- **Pattern:** FS-001 `RequiredEnvironmentValidatorTest` + `AbstractIntegrationTest`
  (Testcontainers) analog. Integration tests marked `@pytest.mark.integration`.

### 7. Worker Stack Profile + docs + harness reference
- **What:** Author `car-auction-sheet-worker/CLAUDE.md` (Stack Profile: layout, config
  contract, logging, testing, lint/format, commands), `README.md`, `.env.example` (the 6
  vars with LocalStack-matching dev defaults; no secrets). Add the worker row to the harness
  `.claude/CLAUDE.md` Reference Map.
- **Files:** `car-auction-sheet-worker/CLAUDE.md`, `car-auction-sheet-worker/README.md`,
  `car-auction-sheet-worker/.env.example`, `.claude/CLAUDE.md` (Reference Map row)
- **Pattern:** FS-001 subtask 7 (reconcile) — here it's *authoring* the profile from scratch.

### 8. Compose-boot verification + startup timing (manual)
- **What:** With the default `pytest` + `ruff`/`mypy` checks green, verify the **docker-compose
  path the spec ACs literally assert** (distinct from the testcontainers T2 suite): run
  `docker compose up` (LocalStack), boot `uvicorn app.main:app` + the consumer against the
  **compose** stack, run `scripts/send-hello.py`, and confirm consume→delete + DLQ wiring
  against the compose queue/DLQ. **Time the `uvicorn` cold start and assert `< 15 s`** (spec
  NFR). Record the exact commands, output, and the measured startup time in `## Progress`,
  and state which ACs the compose path covers (docker-compose/LocalStack boot AC + `<15s`
  NFR) vs. which the testcontainers T2 suite covers (consume/ack, DLQ).
- **Files:** none (verification only)
- **Pattern:** FS-001 subtask 8 (manual `bootRun`-against-compose check + recorded startup
  time, e.g. FS-001's 9.885 s).

## Files to Modify

| File | Repo | Change |
|------|------|--------|
| `pyproject.toml`, `uv.lock` | worker | New — deps (fastapi, uvicorn, boto3, pydantic-settings), tool config (ruff, mypy, pytest) |
| `ruff.toml` | worker | New — Ruff lint+format config (or `[tool.ruff]` in pyproject) |
| `app/main.py`, `app/__init__.py` | worker | New — FastAPI app, `/health`, lifespan starts consumer |
| `app/config.py`, `app/errors.py` | worker | New — pydantic-settings + fail-fast named validation |
| `app/log_config.py` | worker | New — basic JSON logger (named to avoid stdlib `logging` shadow) |
| `app/sqs/client.py`, `app/sqs/consumer.py`, `app/sqs/__init__.py` | worker | New — boto3 client factory + consumer loop |
| `app/handlers/hello_world.py`, `app/handlers/__init__.py` | worker | New — hello-world handler + registry |
| `docker-compose.yml` | worker | New — LocalStack SQS |
| `scripts/init-localstack.sh`, `scripts/send-hello.py` | worker | New — queue/DLQ provisioning + dev producer |
| `tests/conftest.py`, `tests/unit/*.py`, `tests/integration/test_consumer_it.py` | worker | New — T1 + T2 suites |
| `.gitignore`, `.dockerignore` | worker | New — Python/venv hygiene |
| `CLAUDE.md`, `README.md`, `.env.example` | worker | New — Stack Profile + dev docs |
| `.claude/CLAUDE.md` | harness | Add worker repo row to Reference Map |

## Risks

- **LocalStack/Testcontainers Docker dependency** — integration tests need Docker. *Mitigation:* mark them `@pytest.mark.integration` and exclude from the default `pytest` run, so Docker-less CI stays green until FS-012 (FS-001's proven split).
- **boto3 long-poll slowness in tests** — a 20s `WaitTimeSeconds` makes tests hang. *Mitigation:* override to a short poll (1–2s) + bounded receive loop in the integration harness; assert with timeouts.
- **DLQ assertion timing** — a message reaches the DLQ only after `maxReceiveCount` failed receives + visibility-timeout expiry. *Mitigation:* set a short visibility timeout on the test queue and poll the DLQ with a bounded wait; assert `>=1` (never an absolute count — per test-strategy shared-fixture hazard).
- **`uv` adoption** — if the team prefers Poetry, Decision #3 changes the lockfile + commands. *Mitigation:* flagged for plan review before any code.
- **Async vs threaded consumer** — FastAPI is async but boto3 is sync. *Mitigation:* run the consumer loop in a background task/thread off the FastAPI lifespan; keep the loop sync + simple for this slice (no async boto3 wrapper yet).
- **Scope creep into FS-006** — temptation to wire a real Spring Boot producer. *Mitigation:* explicit boundary in Approach; the dev producer is a local script only.

## Test Approach

**Tier: T1 (unit) + T2 (integration).** No frontend, no browser/E2E (backend-only worker
shell). This is a foundation single-plan slice — `forge-plan-review` TC-2/TC-3 (sub-WI
tier-match / AC-coverage) do not bind, but every spec AC maps to a test row below.

### T1 — Unit (pytest, boto3 mocked)

| Test | Proves | Spec AC |
|------|--------|---------|
| `test_health.py::health_ok` | `GET /health` → `{"status":"ok"}` via FastAPI `TestClient` (no SQS/Docker) | health AC |
| `test_config.py::passes_when_all_set` | Settings load when all required vars present | env-validation AC |
| `test_config.py::raises_named_error_per_missing_var` (parametrized over the 6 vars) | Fail-fast names the first missing/blank var, never its value | env-validation AC |
| `test_hello_world.py::handles_valid_payload` | Handler parses + succeeds on a hello-world message | consume/process AC |

### T2 — Integration (pytest + testcontainers-localstack, `@pytest.mark.integration`)

| Test | Proves | Spec AC |
|------|--------|---------|
| `test_consumer_it.py::consumes_and_deletes_message` | Worker connects to LocalStack SQS, receives + processes + deletes a hello-world message | consume/ack AC |
| `test_consumer_it.py::message_lands_on_dlq_after_3_failures` | A always-failing handler → message on DLQ after `maxReceiveCount = 3` | DLQ AC |

Run commands (final form set in subtask 1): `uv run pytest` (T1, default) ·
`uv run pytest -m integration` (T2, Docker required). Coverage tool: `coverage`/`pytest-cov`
(report-only this slice; hard gate deferred to when business logic lands, per FS-001/L-001).

**Two substrates, two AC owners.** The T2 rows above run against **testcontainers-localstack**
(ephemeral, harness-provisioned) and own the consume/ack + DLQ ACs in CI. The spec's
**`docker compose up` boot AC** and the **`<15s` startup NFR** are owned by the **subtask-8
manual compose-boot verification** — they exercise the `docker-compose.yml` +
`scripts/init-localstack.sh` path the AC literally asserts, which the testcontainers suite does
not touch. Both paths must pass for the slice to ship.

## Progress
<!-- Updated during implementation. Mark subtasks as done, note discoveries. -->
- [ ] Subtask 1 — scaffold + tooling + /health
- [ ] Subtask 2 — config + fail-fast validation
- [ ] Subtask 3 — SQS consumer loop
- [ ] Subtask 4 — hello-world handler
- [ ] Subtask 5 — LocalStack docker-compose + provisioning
- [ ] Subtask 6 — T1 + T2 tests
- [ ] Subtask 7 — Stack Profile + docs + harness reference
- [ ] Subtask 8 — compose-boot verification + startup timing (`<15s` NFR)

### Failed Approaches
<!-- none yet -->

## Notes
- **Open for plan review:** Decision #3 (`uv` vs Poetry) and Decision #8 (Ruff as the single
  lint+format tool) are the first Python-tooling choices for the engagement — confirm before
  implementation. Decision #8 is a deliberate application of lesson **L-001**.
- The worker `.env.example` carries LocalStack dev defaults + **placeholder** AWS creds only —
  never real secrets (LocalStack accepts `test`/`test`).
- `AWS_REGION = us-east-1` for local (spec OQ-FS002-2); prod region stays an open architecture
  question and does not block this slice.
- The actual boot command is **`uvicorn app.main:app`** (the spec AC's `uvicorn main:app` was
  illustrative, written before the `app/` package layout was fixed in Decision #2).
- Spring Boot → worker cross-service round-trip is **FS-006**, not this slice.
- **Deviation — config contract (spec FR vs plan Decision #5):** the spec's config FR lists
  `MongoDB URI` ("…, etc."). This plan **defers `MONGODB_URI` to FS-005** (MongoDB is out of
  scope here) and trims the required set to what the worker actually uses to boot + consume.
  The **FS-005 plan owns** adding `MONGODB_URI` to the worker config contract — recorded here
  so the cascade stays traceable.
- **Reconciliation — hello-world origin (spec FR vs approved AC):** the spec FR wording says
  *"Spring Boot enqueues a test message → worker receives"*, but the approved **AC** requires
  only a message *"enqueued against the LocalStack queue"* (no Spring Boot). This slice
  satisfies the **AC** with a local dev producer (`scripts/send-hello.py`); the Spring
  Boot → worker round-trip is **FS-006**. No spec revision needed — the AC is the contract and
  it is met; the FR phrasing is forward-looking to FS-006.
