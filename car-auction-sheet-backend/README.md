# AuctionInsightAI — Spring Boot API

Backend API service for AuctionInsightAI: user-facing operations (auth, GraphQL API, credit
management, admin portal) and orchestration of the async analysis pipeline via AWS SQS, with
real-time delivery over WebSocket.

> Engagement context, gates, and workflow live in
> [`../car-auction-sheet-analyzer-harness/.claude/CLAUDE.md`](../car-auction-sheet-analyzer-harness/.claude/CLAUDE.md).
> Stack, package layout, and conventions for this service live in [`CLAUDE.md`](CLAUDE.md).

## Prerequisites

- **JDK 21** — the Gradle toolchain pins Java 21 and provisions it if needed.
- **Docker** + **Docker Compose** — for the local Postgres dependency and for integration tests
  (Testcontainers).
- No local Gradle install required — use the committed wrapper (`./gradlew`).

## Quick start

```bash
# 1. Configure environment
cp .env.example .env          # then export the vars, or use your IDE/EnvFile plugin

# 2. Start the local Postgres dependency
docker compose up -d postgres

# 3. Run the app
./gradlew bootRun
```

The service starts on `http://localhost:8080`. Verify it is up:

```bash
curl http://localhost:8080/actuator/health
# {"status":"UP"}
```

> **Environment loading.** The app reads configuration from the process environment. `.env` is not
> auto-loaded by Spring; export the variables into your shell (e.g. `set -a; . ./.env; set +a`) or
> configure your IDE run config to use it. Startup fails fast, naming the variable, if any of the
> six mandatory vars (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `AWS_REGION`, `JWT_PRIVATE_KEY`,
> `JWT_PUBLIC_KEY`) is missing.

## Common commands

```bash
./gradlew check             # compile + Checkstyle (Google style) + unit tests + JaCoCo
./gradlew test              # unit tests only
./gradlew integrationTest   # *IT integration tests against Testcontainers Postgres (needs Docker)
./gradlew bootRun           # run the dev server
./gradlew bootJar           # build the executable jar
```

## Project layout

```
src/main/java/com/auctioninsightai/api/
├── config/       # Spring config + startup env validation
├── controller/   # request handlers (added by feature slices)
├── service/      # business logic (added by feature slices)
├── repository/   # Spring Data JPA repositories (added by feature slices)
├── dto/          # API DTOs incl. the ApiResponse envelope
├── exception/    # GlobalExceptionHandler + domain exceptions
└── util/         # shared utilities

src/main/resources/
├── application.yml      # base config (references env vars)
└── db/migration/        # Flyway migrations (none yet)
```

See [`CLAUDE.md`](CLAUDE.md) for the full stack table, environment-variable contract, testing
approach, and coding conventions.

## Error envelope

Every API response uses the project envelope `{ "success": boolean, "error": string|null,
"data": T|null }`. Unmapped paths return `404 {"success":false,"error":"Not Found","data":null}`
rather than an HTML error page.
