# F-007 gRPC Channel

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Shared `.proto` definitions for the Spring Boot ↔ FastAPI direct call interface, generated Java and Python stubs, and a hello-world gRPC call validated in both directions. Used for admin pipeline intervention (Technical Admin edits step output and resumes pipeline) and for FastAPI to call back Spring Boot on pipeline completion.

## Requirements

### Functional Requirements
- Shared `.proto` file defines at minimum two services:
  - `PipelineCallback`: FastAPI → Spring Boot (notify pipeline completion/failure)
  - `PipelineIntervention`: Spring Boot → FastAPI (edit step output, resume from step)
- Java stubs generated (grpc-java + protobuf-maven-plugin or equivalent)
- Python stubs generated (grpcio-tools)
- Hello-world gRPC call: Spring Boot calls FastAPI `PipelineIntervention.Ping` → FastAPI returns pong
- Hello-world gRPC call (reverse): FastAPI calls Spring Boot `PipelineCallback.Ping` → Spring Boot returns pong

### Non-Functional Requirements
- gRPC calls complete in < 100ms on localhost (latency baseline for admin operations)

## Acceptance Criteria
- [ ] `PipelineCallback.proto` and `PipelineIntervention.proto` (or combined) defined and checked into a shared location
- [ ] Java stubs compile without errors
- [ ] Python stubs import without errors
- [ ] Spring Boot → FastAPI hello-world gRPC call succeeds
- [ ] FastAPI → Spring Boot hello-world gRPC call succeeds

## Scope Boundaries

### In Scope
- `.proto` service definitions for PipelineCallback and PipelineIntervention
- Java stub generation (Spring Boot side)
- Python stub generation (FastAPI worker side)
- gRPC server configuration in both services (port, TLS off for dev)
- Hello-world Ping/Pong RPC methods for both services

### Out of Scope
- Actual pipeline intervention business logic (F-003, F-009-b)
- TLS configuration for production (infrastructure concern)

## Constraints and Dependencies
- Blocked by: F-001 (Spring Boot), F-002 (FastAPI worker)
- gRPC for Spring Boot ↔ FastAPI (CLAUDE.md Decision #6)
- Shared proto definitions location: to be decided (could be a shared sub-module or duplicated with sync script)

## Input Sources
- architecture.md §Cross-Cutting Concerns > Inter-Service Communication
- architecture.md §Build Feasibility (gRPC Java↔Python paper sketch)
- architecture.md §Foundation Backlog (F-007)

## Open Questions

## Revisions
