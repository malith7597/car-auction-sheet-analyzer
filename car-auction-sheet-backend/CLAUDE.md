# AuctionInsightAI — Spring Boot API

This is the backend API service for AuctionInsightAI. It handles user-facing operations
(auth, GraphQL API, credit management, admin portal) and orchestrates the async analysis
pipeline via AWS SQS. Real-time delivery to the frontend uses WebSocket.

**Harness context lives in:** `../car-auction-sheet-analyzer-harness/.claude/CLAUDE.md`
Read that file for engagement-wide gates, workflow phases, and quality rules.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3 |
| Build | Gradle (`./gradlew`) |
| API | Spring for GraphQL (GraphQL over HTTP/WebSocket) |
| Auth | Spring Security — JWT RS256, Google OAuth 2.0 |
| ORM | Spring Data JPA (Hibernate) |
| DB migrations | Flyway (`classpath:db/migration`) |
| Database | PostgreSQL 15 (AWS RDS) |
| Connection pool | HikariCP |
| Message queue | AWS SQS v2 (producer role only) |
| gRPC | grpc-java — server receives pipeline callbacks; client sends interventions |
| WebSocket | Spring WebSocket (STOMP over SockJS or raw WS) |
| File storage | AWS SDK v2 for Java — S3 uploads and downloads |
| Monitoring | Spring Actuator (`/actuator/health`, `/actuator/metrics`) |
| Logging | Logback — structured JSON output, correlation ID MDC |
| Lint | Checkstyle (Google Java style) |
| Tests | JUnit 5, Mockito, Testcontainers (PostgreSQL) |
| Coverage | JaCoCo |
| CI | GitHub Actions (`./gradlew check`) |

---

## Architecture Decisions (DO NOT REVERSE)

These decisions are inherited from the engagement-wide table in the harness CLAUDE.md.
The rows below are the ones that directly govern this service's implementation.

| # | Decision | Why | Reversible? |
|---|----------|-----|-------------|
| 1 | Analysis pipeline is **asynchronous** via AWS SQS — this service enqueues jobs; worker consumes them | Resilience, per-step retries, independent scaling; 30s pipeline cannot block an HTTP request | ❌ Hard |
| 2 | **Spring Boot** owns auth, GraphQL, credits, admin, WebSocket. Python FastAPI owns the pipeline worker | Language-optimal split; Java for transactional and auth-heavy work | ❌ Hard |
| 3 | **PostgreSQL** for all transactional entities (User, Analysis, PipelineStep, Credit, CreditTransaction, CreditDisputeRequest) | Relational integrity required for billing and credit safety | ⚠️ Costly |
| 4 | **Spring Boot handles auth directly** — no Cognito, Auth0, or other managed provider | Avoids external dependency and cost; team has Spring Security expertise | ✅ Moderate |
| 5 | **JWT RS256** with claims `user_id`, `role`, `tenant_id`; RBAC via Spring Security `@PreAuthorize` | Stateless auth; role claim enables gateway-level enforcement | ✅ Moderate |
| 6 | **gRPC** for Spring Boot ↔ FastAPI direct calls (pipeline intervention, step callbacks) | Type-safe, performant inter-service protocol; both runtimes have mature gRPC support | ✅ Low |
| 7 | **GraphQL** (not REST) for frontend ↔ this API | Flexible query model for variable report data shapes; single endpoint | ⚠️ Costly |

---

## Package Structure

```
src/main/java/com/auctioninsightai/api/
├── config/          # Spring config beans (security, graphql, websocket, aws, grpc)
├── controller/      # GraphQL resolvers (Query, Mutation, Subscription)
├── service/         # Business logic (AuthService, AnalysisService, CreditService, …)
├── repository/      # Spring Data JPA repositories
├── entity/          # JPA entities (User, Analysis, PipelineStep, Credit, …)
├── dto/             # Request / response DTOs
├── grpc/            # gRPC server handlers + stubs (generated code under grpc-generated/)
├── messaging/       # SQS producer (AnalysisJobProducer)
├── websocket/       # WebSocket hub (AnalysisProgressHandler)
├── security/        # JWT filter, RBAC config, OAuth2 config
├── exception/       # GlobalExceptionHandler, domain exceptions
└── util/            # Shared utilities (CorrelationIdUtil, JsonUtil, …)

src/main/resources/
├── application.yml          # Base config (references env vars)
├── application-local.yml    # Local dev overrides (gitignored)
├── graphql/                 # *.graphqls schema files
└── db/migration/            # Flyway SQL migrations (V__description.sql)
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_URL` | PostgreSQL JDBC URL (e.g. `jdbc:postgresql://host:5432/auctioninsight`) |
| `DB_USERNAME` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_PRIVATE_KEY` | RS256 private key (PEM, base64-encoded) |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM, base64-encoded) |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `AWS_REGION` | AWS region (e.g. `ap-southeast-1`) |
| `AWS_ACCESS_KEY_ID` | AWS access key (local dev; IAM role in prod) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (local dev; IAM role in prod) |
| `SQS_ANALYSIS_QUEUE_URL` | SQS queue URL for analysis jobs |
| `S3_BUCKET_NAME` | S3 bucket for uploads and report PDFs |
| `WORKER_GRPC_HOST` | FastAPI worker gRPC host |
| `WORKER_GRPC_PORT` | FastAPI worker gRPC port (default: 50051) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins for CORS |

Copy `.env.example` to `.env` (gitignored) for local dev. The app fails fast on startup if required vars are missing.

---

## Common Commands

```bash
# Start the local Postgres dependency (required before bootRun — Flyway runs on startup)
docker compose up -d postgres

# Start dev server
./gradlew bootRun

# Run with a specific profile
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# Run all checks (compile + checkstyle + unit tests + jacoco)
./gradlew check

# Unit tests only
./gradlew test

# Integration tests only (*IT, against Testcontainers Postgres — requires a Docker daemon)
./gradlew integrationTest

# Checkstyle report only
./gradlew checkstyleMain checkstyleTest

# Coverage report (build/reports/jacoco/test/html/index.html)
./gradlew jacocoTestReport

# Build the executable jar
./gradlew bootJar
```

---

## Testing Approach

- **Unit tests** (`*Test.java`): JUnit 5 + Mockito. No Spring context loaded. Test service and util classes in isolation.
- **Integration tests** (`*IT.java`): `@SpringBootTest` + Testcontainers PostgreSQL. Test repository and full request path.
- **GraphQL tests**: Use `@GraphQlTest` slice or full integration test against the mounted schema.
- Place test fixtures in `src/test/resources/fixtures/`.
- Coverage reported by JaCoCo. Per-feature minimum thresholds are set in each feature spec.

---

## Key Patterns

### Repository pattern
All DB access goes through Spring Data JPA repositories. No raw JDBC except in migration scripts. Business logic lives in services — repositories expose only `findById`, `findAll`, `save`, `delete`, and query methods named after the domain concept.

### GlobalExceptionHandler
All controller-level exceptions are caught by `GlobalExceptionHandler` (`@RestControllerAdvice`). Return a consistent JSON envelope:
```json
{ "success": false, "error": "MESSAGE", "data": null }
```
Never let Spring's default error page reach the client.

### Correlation IDs
Every inbound request gets a `correlationId` (from `X-Correlation-Id` header, or generated). Set it in MDC at filter entry; propagate it in the SQS job payload and gRPC metadata.

### JWT handling
JWTs are RS256-signed. The JWT filter validates the token and sets the `SecurityContext`. Never hardcode the key pair — load from env vars at startup. If the env vars are missing, the app must refuse to start.

---

## Boundaries

### ALWAYS DO
- Run `./gradlew check` after every code change before committing (and `./gradlew integrationTest` when integration tests are affected)
- Set `correlationId` in MDC on every incoming request
- Write structured JSON logs (no `System.out.println`)
- Use parameterized queries — never concatenate SQL strings
- Validate all user input at GraphQL resolver entry
- Update `../car-auction-sheet-analyzer-harness/.forge/tracker.yaml` when feature state changes

### ASK FIRST
- Add a new Gradle dependency
- Change any DB schema or add a Flyway migration
- Deviate from the approved plan's approach
- Add a new environment variable
- Change the GraphQL schema contract

### NEVER DO
- Commit `.env` files or any file containing credentials
- Commit directly to `main`
- Skip `./gradlew check` before raising a PR
- Log JWT tokens, passwords, or credit card details at any level
- Return stack traces or internal exception messages to API callers
- Add business logic to JPA entities — keep them as plain data containers

---

## Reference Map

| What | Where |
|------|-------|
| Engagement PRD | `../car-auction-sheet-analyzer-harness/.forge/project-prd.md` |
| System architecture | `../car-auction-sheet-analyzer-harness/.forge/design/architecture.md` |
| Harness CLAUDE.md (gates, phases, rules) | `../car-auction-sheet-analyzer-harness/.claude/CLAUDE.md` |
| Feature specs | `../car-auction-sheet-analyzer-harness/.forge/specs/` |
| Foundation specs (this repo) | `../car-auction-sheet-analyzer-harness/.forge/specs/foundation/` (FS-001, FS-004, FS-006, FS-007, FS-008, FS-009, FS-010, FS-012, FS-013) |
| Tracker | `../car-auction-sheet-analyzer-harness/.forge/tracker.yaml` |
| Data model | `docs/data-model.md` (to be created in FS-004) |
| API contracts | `docs/api/` (to be created as features ship) |
| gRPC proto definitions | `proto/` (shared with worker repo; to be created in FS-007) |

---

## Active Context

Foundation phase in-progress. No feature code exists yet. Current work: foundation slices
FS-001 through FS-013 — all specs written, plans pending.

This service contributes to: FS-001, FS-004, FS-006, FS-007, FS-008, FS-009, FS-010, FS-012, FS-013.
