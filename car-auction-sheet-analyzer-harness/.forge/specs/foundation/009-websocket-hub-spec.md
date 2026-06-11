# F-009 WebSocket Hub

> Status: draft
> Author:
> Reviewed by:
> Date: 2026-05-31

## Context
Spring Boot WebSocket configured with STOMP over SockJS. A test client (React SPA or curl) connects and receives a server-pushed test event. This is the substrate for real-time pipeline completion notifications (product feature f-006).

## Requirements

### Functional Requirements
- Spring Boot WebSocket endpoint configured (e.g., `/ws`)
- STOMP over SockJS supported
- Server can push a message to a connected client on a named topic (e.g., `/topic/test`)
- Client subscribes to a topic and receives pushed messages
- Connection is authenticated (JWT validated on WebSocket handshake)

### Non-Functional Requirements
- WebSocket handshake completes in < 500ms

## Acceptance Criteria
- [ ] React SPA (or wscat) connects to `/ws` without error
- [ ] Client subscribes to `/topic/test` and receives a server-pushed message within 2 seconds of trigger
- [ ] Unauthenticated WebSocket connection attempt is rejected

## Scope Boundaries

### In Scope
- Spring WebSocket + STOMP configuration
- SockJS fallback support
- JWT validation on WebSocket handshake (uses F-008 auth scaffolding)
- Test push endpoint: `POST /internal/ws/test` → pushes message to `/topic/test`
- React SPA: SockJS + STOMP client connected to `/ws` (hello-world only)

### Out of Scope
- Per-user topic routing (e.g., `/user/{id}/analysis`) — ships with f-006
- Analysis completion push logic (f-006)

## Constraints and Dependencies
- Blocked by: F-001 (Spring Boot), F-003 (React SPA), F-008 (auth scaffolding)
- WebSocket for real-time push (CLAUDE.md Decision #7)

## Input Sources
- architecture.md §Cross-Cutting Concerns > Inter-Service Communication
- architecture.md §Foundation Backlog (F-009)

## Open Questions

## Revisions
