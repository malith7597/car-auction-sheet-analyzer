# FS-001 App Shell — Spring Boot — Plan

> Spec: `.forge/specs/foundation/001-app-shell-spring-boot-spec.md`
> Status: approved
> Author: malith3
> Reviewed by: malith3 (lead)
> Date: 2026-06-16 (drafted) · 2026-06-16 (approved after single-pass review)
> Reviewed-via: /forge-plan-review (single-pass, 2026-06-16)

## Approach

Scaffold a new Gradle + Spring Boot 3 / Java 21 application into the existing
`car-auction-sheet-backend` directory. The repo is empty of *code* but **already has a
populated `CLAUDE.md` Stack Profile** (authored 2026-06-02) that documents the package
layout, error envelope, env vars, testing approach, and conventions every later backend
slice inherits. This plan conforms to that profile — and **reconciles the parts of it
that are stale**: the profile still says Maven (`./mvnw`) throughout, but the engagement
decided to move to Gradle (reflected in the approved spec's `./gradlew` ACs). FS-001 is
where that reconciliation lands.

Six concerns from the approved spec (incl. Rev 1) drive the work:
1. A runnable Spring Boot 3 shell using the **documented** package layout
   `com.auctioninsightai.api.{config,controller,service,repository,exception,util}`.
2. **Fail-fast env-var validation** naming the missing variable, covering all six
   contract vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `AWS_REGION`,
   `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` (spec Rev 1 — full env contract up front).
3. A **public** Actuator health endpoint returning `{"status":"UP"}`.
4. Flyway running on startup against a **local docker-compose Postgres** (zero
   migrations — no-op acceptable).
5. A **global exception handler** emitting the project envelope
   `{"success":false,"error":"…","data":null}` (per CLAUDE.md Key Patterns + spec
   Rev 1), including a JSON 404 for unmapped paths (not the Whitelabel HTML page).
6. The T1/T2 test stack proving the above with the **documented** toolchain (JUnit 5 +
   Mockito + Testcontainers + Checkstyle + JaCoCo), plus a green `./gradlew check` and a
   manual `bootRun`-against-compose check.

Spring Security is intentionally **not** added in this slice — FS-008 introduces it and
must keep `/actuator/health` public. Integration tests use Testcontainers Postgres so
they are CI-portable and independent of the dev compose stack.

## Decisions

| # | Decision | Why |
|---|----------|-----|
| 1 | Gradle **Groovy DSL** (`build.gradle`), Spring Boot **3.3.5**, Java 21 toolchain (pinned via Gradle `java.toolchain`) | Engagement decided Maven→Gradle (prior session); pinned versions + committed wrapper give reproducible builds. **Note:** this build-tool move is not yet recorded as an Architecture Decision — see Notes (follow-up to capture it as an AD and reconcile the repo CLAUDE.md). |
| 2 | Base package `com.auctioninsightai.api`; layers `config` / `controller` / `service` / `repository` / `exception` / `util` | Matches the **documented** package structure in backend CLAUDE.md (§Package Structure) and the spec's "controller / service / repository / config layers". FS-001 only needs `config`, `exception` now; the rest are created empty-as-needed by later slices. |
| 3 | Env validation via a plain `RequiredEnvironmentValidator` class invoked by an `EnvironmentPostProcessor` (registered in `spring.factories`) | Runs before context refresh → fails fast; the class is a pure unit (takes a `ConfigurableEnvironment`), so AC#4's "names the missing variable" is T1-testable without booting Spring. |
| 4 | Throw + handle `NoHandlerFoundException` for 404: set `spring.mvc.throw-exception-if-no-handler-found=true` and `spring.web.resources.add-mappings=false` | Default Spring serves a Whitelabel HTML 404; these two flags route unmapped paths through `@RestControllerAdvice` so we emit structured JSON (AC#6). |
| 5 | `@RestControllerAdvice GlobalExceptionHandler` returning the **project envelope** via an `ApiResponse<T>` record (`success`, `error`, `data`) — `ApiResponse.error(msg)` for failures | Matches backend CLAUDE.md Key Patterns → GlobalExceptionHandler `{success,error,data}` + spec Rev 1. Single envelope reused by every later feature; record is immutable per coding-style. |
| 6 | Flyway enabled, `baseline-on-migrate=true`, migrations at `src/main/resources/db/migration/` (empty, `.gitkeep`) | Slice ships migration tooling, not entities; baseline lets a clean DB start cleanly. |
| 7 | Test stack: JUnit 5 + Mockito + **Testcontainers** (Postgres) + AssertJ | Matches backend CLAUDE.md §Testing (`*Test` unit, `*IT` integration with `@SpringBootTest` + Testcontainers). T2 needs no hand-run DB; CI-portable. |
| 8 | Lint = **Checkstyle (Google Java style)**; coverage = **JaCoCo**; both wired into `./gradlew check` | Matches backend CLAUDE.md §Stack (Checkstyle + JaCoCo). Gives the mandatory "lint passes" + coverage gates concrete Gradle implementations. (Spotless was rejected at review — it's a formatter, not the documented linter, and trips a JDK 21 `--add-exports` footgun.) |
| 9 | `docker-compose.yml` ships a Postgres 15 service only (matches architecture RDS target) | Lets `./gradlew bootRun` boot on a clean checkout (spec AC#1) without external infra. |

## Subtasks

### 1. Gradle Spring Boot scaffold + package structure
- **What:** Initialize the Gradle Boot 3.3.5 project, commit the wrapper, create the
  `com.auctioninsightai.api` package layout + main class, and `docker-compose.yml`
  (Postgres 15). App boots against the compose DB.
- **Files:**
  - `build.gradle`, `settings.gradle`, `gradlew`, `gradlew.bat`, `gradle/wrapper/*`
  - `docker-compose.yml`
  - `src/main/java/com/auctioninsightai/api/AuctionInsightApiApplication.java`
  - `src/main/resources/application.yml`
- **Pattern:** Spring Initializr layout (web, actuator, data-jpa, flyway, postgresql, validation).

### 2. Required-env-var validator (fail-fast, named — 6 vars)
- **What:** `RequiredEnvironmentValidator` checking the six contract vars (`DB_URL`,
  `DB_USERNAME`, `DB_PASSWORD`, `AWS_REGION`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`);
  throws `MissingEnvironmentVariableException` naming the first missing one. Wire via
  `EnvironmentPostProcessor` + `META-INF/spring.factories`.
- **Files:**
  - `src/main/java/com/auctioninsightai/api/config/RequiredEnvironmentValidator.java`
  - `src/main/java/com/auctioninsightai/api/config/EnvironmentValidationPostProcessor.java`
  - `src/main/java/com/auctioninsightai/api/exception/MissingEnvironmentVariableException.java`
  - `src/main/resources/META-INF/spring.factories`
- **Pattern:** new — establishes the env-contract pattern for later slices.

### 3. Actuator health endpoint (public)
- **What:** Add actuator; expose `health`; assert UP shape; no security dependency so it
  stays public.
- **Files:** `src/main/resources/application.yml` (`management.endpoints.web.exposure.include: health`)
- **Pattern:** Spring Boot Actuator defaults.

### 4. Flyway configuration
- **What:** Enable Flyway on startup, empty migrations dir, baseline-on-migrate.
- **Files:** `src/main/resources/application.yml` (flyway block),
  `src/main/resources/db/migration/.gitkeep`
- **Pattern:** Spring Boot Flyway auto-config.

### 5. Global exception handler + structured JSON envelope (incl. 404)
- **What:** `ApiResponse<T>` record + `GlobalExceptionHandler` (`@RestControllerAdvice`)
  handling `NoHandlerFoundException` → 404 `{success:false,error,data:null}` and a
  generic fallback → 500 envelope; set the two MVC flags from Decision #4.
- **Files:**
  - `src/main/java/com/auctioninsightai/api/dto/ApiResponse.java`
  - `src/main/java/com/auctioninsightai/api/exception/GlobalExceptionHandler.java`
  - `src/main/resources/application.yml` (mvc flags)
- **Pattern:** backend CLAUDE.md Key Patterns → GlobalExceptionHandler envelope.

### 6. Test toolchain + tests
- **What:** Wire JUnit5/Mockito/Testcontainers/Checkstyle/JaCoCo; author the T1 validator
  unit test and the T2 integration tests (context load, health, public-health, Flyway
  ran, 404 envelope). Define a Gradle `integrationTest` task for `*IT` classes.
- **Files:**
  - `build.gradle` (test deps + checkstyle + jacoco + integrationTest task)
  - `config/checkstyle/checkstyle.xml` (Google style)
  - `src/test/java/com/auctioninsightai/api/...` (see Test Approach)
  - `src/test/resources/application-test.yml`
- **Pattern:** establishes the resolved backend toolchain rows in `.forge/test-strategy.md`.

### 7. Reconcile the existing repo `CLAUDE.md` + dev docs
- **What:** **Reconcile** (not author) `car-auction-sheet-backend/CLAUDE.md` — flip the
  stale Maven references to Gradle: §Stack `Build` row (`Maven (./mvnw)` → `Gradle
  (./gradlew)`), `Lint`/`Tests`/`CI` rows confirmed (Checkstyle/JUnit/JaCoCo already
  correct), §Common Commands (`./mvnw …` → `./gradlew …`), §Boundaries "Add a new Maven
  dependency" → Gradle, "Run `./mvnw verify`" → "`./gradlew check`". Then author
  `README.md` (run instructions) and `.env.example` (the six mandatory vars + the other
  documented vars as placeholders).
- **Files:**
  - `CLAUDE.md` — **reconcile existing** (Maven→Gradle flips above; keep `## Stack`
    heading name as-is)
  - `README.md`, `.env.example` — new
- **Pattern:** mirrors the harness CLAUDE.md Reference Map's backend-repo row.

### 8. Green `./gradlew check` + manual boot verification
- **What:** Checkstyle + tests + JaCoCo + build all green; **plus** a manual
  `docker compose up -d postgres && ./gradlew bootRun` to verify AC#1's compose-boot
  path (the ITs prove the Testcontainers path, not compose) and time startup for AC#7.
  Record all commands + output as evidence.
- **Files:** — (verification)

## Files to Modify

| File | Repo | Change |
|------|------|--------|
| `build.gradle`, `settings.gradle`, `gradlew*`, `gradle/wrapper/*` | car-auction-sheet-backend | New — Gradle Boot 3.3.5 build, deps, Checkstyle, JaCoCo, integrationTest task |
| `docker-compose.yml` | car-auction-sheet-backend | New — local Postgres 15 |
| `src/main/java/com/auctioninsightai/api/AuctionInsightApiApplication.java` | car-auction-sheet-backend | New — main class |
| `src/main/java/com/auctioninsightai/api/config/RequiredEnvironmentValidator.java` + `EnvironmentValidationPostProcessor.java` | car-auction-sheet-backend | New — fail-fast env validation (6 vars) |
| `src/main/java/com/auctioninsightai/api/exception/MissingEnvironmentVariableException.java` | car-auction-sheet-backend | New |
| `src/main/java/com/auctioninsightai/api/dto/ApiResponse.java` | car-auction-sheet-backend | New — `{success,error,data}` envelope |
| `src/main/java/com/auctioninsightai/api/exception/GlobalExceptionHandler.java` | car-auction-sheet-backend | New — structured JSON errors + 404 |
| `src/main/resources/application.yml` | car-auction-sheet-backend | New — actuator, flyway, mvc 404 flags, datasource |
| `src/main/resources/META-INF/spring.factories` | car-auction-sheet-backend | New — register env post-processor |
| `src/main/resources/db/migration/.gitkeep` | car-auction-sheet-backend | New — empty migrations dir |
| `config/checkstyle/checkstyle.xml` | car-auction-sheet-backend | New — Google Java style |
| `src/test/java/com/auctioninsightai/api/**` | car-auction-sheet-backend | New — T1 + T2 tests |
| `src/test/resources/application-test.yml` | car-auction-sheet-backend | New — Testcontainers wiring |
| `CLAUDE.md` | car-auction-sheet-backend | **Reconcile existing** — Maven→Gradle flips (§Stack, §Common Commands, §Boundaries) |
| `README.md`, `.env.example` | car-auction-sheet-backend | New — dev docs + 6 mandatory vars |

## Risks

| Risk | Mitigation |
|------|-----------|
| Testcontainers requires a Docker daemon in CI | FS-012 (Build & CI) provisions Docker on the runner; until then T2 runs locally. Note the dependency in the FS-012 spec. |
| `EnvironmentPostProcessor` runs before logging init — a thrown error may print rawly | Acceptable: the message still names the variable (AC#4); throw a clear message. |
| Default static-resource mapping can swallow 404s before the advice sees them | Decision #4's two flags are required together; T2 test `returns404Envelope` is the guard against regression. |
| `baseline-on-migrate` masking a real migration failure later | Only an issue once entities ship (FS-004+); revisit when first migration lands. |
| Reconciling CLAUDE.md may miss a stale Maven reference | Subtask 7 enumerates the specific lines; grep `mvn`/`mvnw`/`Maven` in CLAUDE.md after the edit to confirm none remain. |
| Gradle/Java 21 toolchain mismatch on dev machines | Pin Java 21 via Gradle toolchain block so Gradle provisions the JDK; document in README. |

## Test Approach

**Tier: T1 (unit) + T2 (integration).** Backend-only slice — no UI, no cross-repo
seam, so no T3/T-E2E. This plan **establishes** the backend toolchain rows in
`.forge/test-strategy.md` per the repo CLAUDE.md (JUnit 5 + Mockito + Testcontainers +
AssertJ; Checkstyle lint; JaCoCo coverage). Run command: `./gradlew check`
(unit + checkstyle + jacoco); `./gradlew integrationTest` for `*IT`.

### T1 — Unit

| Test file | Behavior under test | AC |
|-----------|--------------------|----|
| `RequiredEnvironmentValidatorTest` | passes when all six vars present | AC#4 (inverse) |
| `RequiredEnvironmentValidatorTest` | throws naming the missing variable when one is absent (parameterized over all six) | AC#4 |

### T2 — Integration (Testcontainers Postgres)

| Test file | Behavior under test | AC |
|-----------|--------------------|----|
| `ApplicationContextIT` | context loads and app starts against a real DB | AC#1 (Testcontainers path) |
| `HealthEndpointIT` | `GET /actuator/health` → 200 `{"status":"UP"}` | AC#2 |
| `HealthEndpointIT` | `/actuator/health` reachable with no auth header | AC#3 |
| `FlywayMigrationIT` | Flyway ran on startup (`flyway_schema_history` table exists, 0 migrations) | AC#5 |
| `GlobalExceptionHandlerIT` | `GET /no-such-endpoint` → 404 `{"success":false,"error":"Not Found","data":null}` (not HTML) | AC#6 |

**AC coverage:** AC#2–6 each map to ≥1 automated test. **AC#1** is covered by
`ApplicationContextIT` (Testcontainers path) **and** the subtask-8 manual
`bootRun`-against-compose check (the path AC#1 literally asserts). **AC#7** (startup
< 30s) is informally timed during subtask 8 — recorded in `## Progress`, not automated.

### Test checklist (applicable rows)
- [ ] T1 unit tests for the env-validation business logic
- [ ] T2 integration tests for the wired-together shell (context, health, Flyway, 404)
- [ ] Security: `/actuator/health` public assertion (pre-emptive guard for FS-008)
- [ ] No T3/T-E2E (no UI / no seam in this slice)

## Progress
- [x] Subtask 1 — Gradle scaffold + package structure + docker-compose (commit `8de38c9`)
- [x] Subtask 2 — Required-env-var validator (6 vars) (commit `ca263e8`)
- [x] Subtask 3 — Actuator health (public) (commit `36ef64f`)
- [x] Subtask 4 — Flyway config (commit `cc51aae`)
- [x] Subtask 5 — Global exception handler + `{success,error,data}` 404 (commit `2f3f55a`)
- [x] Subtask 6 — Test toolchain (Checkstyle/JaCoCo/Testcontainers) + T1/T2 tests (commit `bb9862a`)
- [x] Subtask 7 — Reconcile repo CLAUDE.md (Maven→Gradle) + dev docs (commit `3dc40da`)
- [x] Subtask 8 — `./gradlew check` green + manual compose `bootRun` (evidence below)
- [x] AC#7 — bootRun startup timed at **9.885 s** (< 30 s)

### Verification Evidence (2026-06-16)

**Automated — `./gradlew check` green (unit + Checkstyle main/test + JaCoCo):**
- `RequiredEnvironmentValidatorTest` — 7 tests, 0 failures (AC#4: passes with all six vars;
  throws naming the missing one, parameterized over all six).

**Automated — `./gradlew integrationTest` green (Testcontainers Postgres 15):**
- `ApplicationContextIT` 1, `HealthEndpointIT` 2, `FlywayMigrationIT` 2,
  `GlobalExceptionHandlerIT` 1 — 6 tests, 0 failures. Covers AC#1 (Testcontainers path),
  AC#2, AC#3, AC#5, AC#6.

**Manual — `docker compose up -d postgres` + `java -jar` against the compose DB:**
- AC#1: app booted against compose Postgres; `Tomcat started on port 8080`.
- AC#2/#3: `GET /actuator/health` → `200 {"status":"UP"}` (no auth header).
- AC#5: Flyway ran (`FlywayExecutor … Database: …/auctioninsight (PostgreSQL 15.18)`).
- AC#6: `GET /no-such-endpoint` → `404 {"success":false,"error":"Not Found","data":null}`.
- AC#7: `Started AuctionInsightApiApplication in 9.885 seconds`.
- AC#4 (manual smoke): booting with `AWS_REGION` unset exited `1` with
  `MissingEnvironmentVariableException: Required environment variable is missing or blank: AWS_REGION`.

### Failed Approaches
<!-- none yet -->

## Notes
- **Follow-up (Reflect):** the Maven→Gradle build-tool move is not yet recorded as an
  Architecture Decision. Capture it as a new AD row in the harness `CLAUDE.md` (or note
  it as a deliberate build-tool choice) so the reconciled repo CLAUDE.md has a traceable
  rationale. Tracked here so it isn't lost.
- This plan establishes the backend toolchain; once approved, backfill the resolved
  `[…]` rows in `.forge/test-strategy.md` (backend columns) during Reflect.
- Spring Security is deliberately deferred to FS-008; FS-008's plan must permit
  `/actuator/health` so AC#3 keeps holding.
- `AWS_REGION`, `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` need placeholder values in
  `.env.example` for boot; the real `AWS_REGION` is an open question (architecture.md
  §Open Questions). JWT keys are consumed by FS-008.

### Implementation notes / minor deviations (2026-06-16)
- **Extra scaffold files beyond the plan's file list:** `.gitignore` (build/.gradle/.env)
  and `.gitattributes` (LF `gradlew`, CRLF `*.bat`, binary jars) — repo hygiene so the
  committed wrapper runs on Linux/CI; harmless additions.
- **Gradle wrapper bootstrapped from the `gradle/gradle` v8.10.2 tag** (no local Gradle on the
  dev machine); `distributionUrl` repinned from the tag's milestone build to the stable
  `gradle-8.10.2-bin.zip`.
- **`config/checkstyle/checkstyle-suppressions.xml`** (not in the plan's file list): a scoped
  suppression of `AbbreviationAsWordInName` for `*IT` test classes only — the mandated Failsafe
  `*IT` suffix is two consecutive capitals that stock google_checks flags. Production code stays
  fully strict (`maxWarnings = 0`).
- **JaCoCo wired (report generated) but no hard coverage-threshold gate** in this slice. The
  unit-testable logic (the validator) is fully covered; the wired-shell beans are covered by the
  `integrationTest` suite, which runs separately from `test`, so a per-`test` 80 % gate would be
  misleading here. Revisit a coverage gate when business logic lands (FS-004+).
- **Google Java style ⇒ 2-space indentation for all Java** is now the established backend
  convention (no formatter — Spotless was rejected at plan review). Hand-maintaining
  google_checks continuation-indent rules without a formatter is a friction point worth a Reflect
  finding (candidate: a 4-space custom Checkstyle config, or revisit the no-formatter stance).
