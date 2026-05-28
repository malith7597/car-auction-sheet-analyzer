/* Generated from ../tracker.yaml by hooks/regen-tracker-dashboard.sh. Do not edit. */
window.TRACKER = {
  "project": "[Project Name]",
  "harness_version": "0.22.1",
  "last_updated": "YYYY-MM-DDTHH:MM:SS",
  "setup": {
    "status": "not-started",
    "project_prd": {
      "status": "not-started",
      "last_gate_run": null,
      "owner": null,
      "notes": "",
      "accepted_risks": []
    },
    "architecture": {
      "status": "not-started",
      "last_gate_run": null,
      "owner": null,
      "notes": "",
      "accepted_risks": [],
      "spikes": []
    },
    "foundation": {
      "status": "not-started",
      "last_updated": null,
      "owner": null,
      "backlog_source": ".forge/design/architecture.md → Foundation Backlog section",
      "review_completed": null,
      "review_audit_ref": null,
      "notes": "Blocked until architecture (Gate 2) passes; foundation backlog populated by /forge-arch-probe",
      "slices": []
    },
    "decomposition": {
      "status": "not-started",
      "last_gate_run": null,
      "owner": null,
      "notes": "Blocked until PRD (Gate 1), architecture (Gate 2), and foundation (§4.10) all complete"
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
    "current_phase": null,
    "phases": []
  },
  "features": {}
}
;
