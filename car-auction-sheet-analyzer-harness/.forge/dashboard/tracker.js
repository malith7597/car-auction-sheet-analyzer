/* Generated from ../tracker.yaml by hooks/regen-tracker-dashboard.sh. Do not edit. */
window.TRACKER = {
  "project": "AuctionInsightAI",
  "harness_version": "0.30.0",
  "last_updated": "2026-06-16T12:00:00",
  "github_org": "malith7597",
  "setup": {
    "status": "in-progress",
    "project_prd": {
      "status": "gate1-passed",
      "last_gate_run": "2026-05-29",
      "owner": "malith3",
      "notes": "Gate 1 passed on Run 2. Run 1 failed with 3 gaps (fixed before re-run).",
      "accepted_risks": []
    },
    "architecture": {
      "status": "gate2-passed",
      "last_gate_run": "2026-05-31",
      "owner": "malith3",
      "notes": "Gate 2 passed Run 1. SP-ARCH-001 (pipeline latency benchmark) and SP-ARCH-002 (mesh.ai validation) scoped for Week 1 of implementation.",
      "accepted_risks": [],
      "spikes": []
    },
    "foundation": {
      "status": "in-progress",
      "last_updated": "2026-06-16",
      "owner": "malith3",
      "backlog_source": ".forge/design/architecture.md → Foundation Backlog section",
      "review_completed": null,
      "review_audit_ref": null,
      "notes": "Foundation phase started 2026-06-01. 13 slices across backend, worker, and frontend repos.",
      "slices": [
        {
          "id": "FS-001",
          "title": "App shell — Spring Boot",
          "spec": ".forge/specs/foundation/001-app-shell-spring-boot-spec.md",
          "plan": ".forge/plans/foundation/001-app-shell-spring-boot-plan.md",
          "status": "review",
          "assignee": "malith3",
          "started": "2026-06-16",
          "last_updated": "2026-06-16",
          "notes": "Implemented across 7 subtask commits (8de38c9..3dc40da). ./gradlew check green (7 unit + Checkstyle + JaCoCo); ./gradlew integrationTest green (6 Testcontainers ITs); manual compose bootRun verified all 7 ACs (startup 9.885s). PR #6 open (malith7597/car-auction-sheet-analyzer). Repo: car-auction-sheet-backend"
        },
        {
          "id": "FS-002",
          "title": "App shell — FastAPI worker",
          "spec": ".forge/specs/foundation/002-app-shell-fastapi-worker-spec.md",
          "plan": ".forge/plans/foundation/002-app-shell-fastapi-worker-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "FastAPI worker boots, connects to SQS, processes a hello-world job end-to-end. Repo: <worker-repo>"
        },
        {
          "id": "FS-003",
          "title": "App shell — React SPA",
          "spec": ".forge/specs/foundation/003-app-shell-react-spa-spec.md",
          "plan": ".forge/plans/foundation/003-app-shell-react-spa-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Vite + React boots, routing skeleton, GraphQL client wired, dev server runs. Repo: <frontend-repo>"
        },
        {
          "id": "FS-004",
          "title": "Data layer — PostgreSQL",
          "spec": ".forge/specs/foundation/004-data-layer-postgresql-spec.md",
          "plan": ".forge/plans/foundation/004-data-layer-postgresql-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "RDS connection, Flyway migration tooling configured, repository base classes (no entity migrations yet). Repo: <backend-repo>"
        },
        {
          "id": "FS-005",
          "title": "Data layer — MongoDB",
          "spec": ".forge/specs/foundation/005-data-layer-mongodb-spec.md",
          "plan": ".forge/plans/foundation/005-data-layer-mongodb-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "MongoDB connection, repository base class for Report documents. Repo: <worker-repo>"
        },
        {
          "id": "FS-006",
          "title": "Message queue wiring",
          "spec": ".forge/specs/foundation/006-message-queue-wiring-spec.md",
          "plan": ".forge/plans/foundation/006-message-queue-wiring-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "SQS producer in Spring Boot + SQS consumer in FastAPI; hello-world job round-trip passes. Repos: both"
        },
        {
          "id": "FS-007",
          "title": "gRPC channel",
          "spec": ".forge/specs/foundation/007-grpc-channel-spec.md",
          "plan": ".forge/plans/foundation/007-grpc-channel-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Shared .proto definitions, generated Java + Python stubs, hello-world gRPC call Spring Boot <-> FastAPI passes. Repos: both"
        },
        {
          "id": "FS-008",
          "title": "Auth scaffolding",
          "spec": ".forge/specs/foundation/008-auth-scaffolding-spec.md",
          "plan": ".forge/plans/foundation/008-auth-scaffolding-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "JWT RS256 issue/validate, Google OAuth 2.0 flow, RBAC annotations wired (no user-story flows yet). Repo: <backend-repo>"
        },
        {
          "id": "FS-009",
          "title": "WebSocket hub",
          "spec": ".forge/specs/foundation/009-websocket-hub-spec.md",
          "plan": ".forge/plans/foundation/009-websocket-hub-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Spring Boot WebSocket configured; client connects and receives a test push event. Repos: both"
        },
        {
          "id": "FS-010",
          "title": "S3 wiring",
          "spec": ".forge/specs/foundation/010-s3-wiring-spec.md",
          "plan": ".forge/plans/foundation/010-s3-wiring-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Upload and download via AWS SDK confirmed working. Repos: both"
        },
        {
          "id": "FS-011",
          "title": "Design system primitives",
          "spec": ".forge/specs/foundation/011-design-system-primitives-spec.md",
          "plan": ".forge/plans/foundation/011-design-system-primitives-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Design tokens, atomic components (Button, Input, Card, Layout). Repo: <frontend-repo>"
        },
        {
          "id": "FS-012",
          "title": "Build & CI",
          "spec": ".forge/specs/foundation/012-build-ci-spec.md",
          "plan": ".forge/plans/foundation/012-build-ci-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Lint / typecheck / tests / build green on hello-world commit for all three repos. Repos: all"
        },
        {
          "id": "FS-013",
          "title": "Observability stubs",
          "spec": ".forge/specs/foundation/013-observability-stubs-spec.md",
          "plan": ".forge/plans/foundation/013-observability-stubs-plan.md",
          "status": "spec",
          "assignee": null,
          "started": null,
          "last_updated": "2026-06-01",
          "notes": "Structured JSON logger, correlation ID propagation, error reporter wired in all services. Repos: all"
        }
      ]
    },
    "decomposition": {
      "status": "gate3-passed",
      "last_gate_run": "2026-05-31",
      "owner": "malith3",
      "notes": "Gate 3 passed. 14 features across 3 delivery phases. Slicing: by capability module. Cuts: F-002 substrate-cut, F-007 substrate-cut, F-009 cluster-cut."
    },
    "technical_decisions": {
      "status": "not-started",
      "owner": null,
      "notes": ""
    },
    "claude_md": {
      "status": "not-started",
      "owner": null,
      "notes": ""
    },
    "environment": {
      "status": "not-started",
      "owner": null,
      "notes": ""
    },
    "feature_breakdown": {
      "status": "not-started",
      "owner": null,
      "notes": "Produced by /forge-decompose (Gate 3) — blocked until PRD and architecture pass their gates"
    }
  },
  "delivery": {
    "ship_unit": "wave",
    "current_phase": 1,
    "phases": [
      {
        "id": 1,
        "title": "Core Analysis",
        "theme": "User can upload a USS auction sheet and receive a 3D-enhanced vehicle intelligence report",
        "status": "in-progress",
        "started": "2026-05-31",
        "sealed": null,
        "due_date": null
      },
      {
        "id": 2,
        "title": "User Operations",
        "theme": "Users manage analysis history, purchase credits, dispute failed analyses, and receive email notifications",
        "status": "locked",
        "started": null,
        "sealed": null,
        "due_date": null
      },
      {
        "id": 3,
        "title": "Admin Portal",
        "theme": "Internal team can manage disputes, inspect pipeline health, and configure the platform",
        "status": "locked",
        "started": null,
        "sealed": null,
        "due_date": null
      }
    ]
  },
  "features": {
    "f-001": {
      "title": "User Authentication & Registration",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "FR-4 keep-as-one: single authentication/session envelope"
    },
    "f-002-a": {
      "title": "Upload Substrate",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-001",
        "f-007-a"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Substrate sibling of F-002 substrate-cut"
    },
    "f-002-b": {
      "title": "Upload UI",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-001",
        "f-002-a"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Surface sibling of F-002 substrate-cut"
    },
    "f-003": {
      "title": "Analysis Pipeline",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-002-a"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "FR-4 keep-as-one: single processing envelope in FastAPI worker. OQ-2 (LLM provider) blocks final implementation."
    },
    "f-004": {
      "title": "3D Damage Render",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-003"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "SP-ARCH-002 spike must run before implementation"
    },
    "f-005": {
      "title": "Vehicle Intelligence Report",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-003",
        "f-004"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "FR-4 keep-as-one: single report delivery surface"
    },
    "f-006": {
      "title": "Analysis History & Real-time Notification",
      "phase": "backlog",
      "delivery_phase": 2,
      "owner": null,
      "priority": "medium",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-001",
        "f-005"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": ""
    },
    "f-007-a": {
      "title": "Credit Substrate",
      "phase": "backlog",
      "delivery_phase": 1,
      "owner": null,
      "priority": "high",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-001"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Substrate sibling of F-007 substrate-cut"
    },
    "f-007-b": {
      "title": "Credit Purchase",
      "phase": "backlog",
      "delivery_phase": 2,
      "owner": null,
      "priority": "medium",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-007-a"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Surface sibling of F-007 substrate-cut. OQ-1 (payment gateway) blocks implementation."
    },
    "f-008": {
      "title": "Credit Dispute Flow",
      "phase": "backlog",
      "delivery_phase": 2,
      "owner": null,
      "priority": "medium",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-003",
        "f-007-a"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "FR-4 keep-as-one: single dispute lifecycle state machine"
    },
    "f-009-a": {
      "title": "Support Admin Portal",
      "phase": "backlog",
      "delivery_phase": 3,
      "owner": null,
      "priority": "low",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-008"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Cluster sibling of F-009 cluster-cut"
    },
    "f-009-b": {
      "title": "Technical Admin Portal",
      "phase": "backlog",
      "delivery_phase": 3,
      "owner": null,
      "priority": "low",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-003"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Cluster sibling of F-009 cluster-cut"
    },
    "f-009-c": {
      "title": "Super Admin Portal",
      "phase": "backlog",
      "delivery_phase": 3,
      "owner": null,
      "priority": "low",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-007-b",
        "f-009-a",
        "f-009-b"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "Cluster sibling of F-009 cluster-cut (superset)"
    },
    "f-010": {
      "title": "Email Notifications",
      "phase": "backlog",
      "delivery_phase": 2,
      "owner": null,
      "priority": "medium",
      "started": null,
      "spec": "draft",
      "plan": "n/a",
      "blocked_by": [
        "f-003",
        "f-008"
      ],
      "due_date": null,
      "follow_up_of": [],
      "last_updated": "2026-05-31T00:00:00",
      "notes": "OQ-4 (email provider) blocks implementation."
    }
  },
  "bugs": []
}
;
