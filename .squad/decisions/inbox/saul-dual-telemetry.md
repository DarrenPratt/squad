# Decision: Dual-mode OTel telemetry (Issue #343)

**By:** Saul
**Date:** 2026-02-24
**PR:** #352

## What
Added `squad.mode` resource attribute to OTel initialization and created `initAgentModeTelemetry()` convenience function for the Copilot agent-mode entry point.

## Why
Brady wants telemetry from both CLI and Copilot agent surfaces. The two modes need distinct `serviceName` and `squad.mode` attributes so they're distinguishable in Aspire dashboards and trace queries.

## How
- `OTelConfig.mode` → written as `squad.mode` resource attribute in `buildResource()`
- `initAgentModeTelemetry()` in `otel-init.ts` → pre-configures `serviceName: 'squad-copilot-agent'`, `mode: 'copilot-agent'`
- `runShell()` now passes `mode: 'cli'` to tag CLI telemetry
- Exported from SDK barrel so consumers can `import { initAgentModeTelemetry } from '@bradygaster/squad-sdk'`

## Team impact
- **Any agent building the Copilot agent-mode entry point:** Call `initAgentModeTelemetry()` at startup and `handle.shutdown()` on exit. That's it.
- **Existing CLI telemetry:** Now tagged with `squad.mode = 'cli'` — no breaking change.
- **Dashboard queries:** Filter by `squad.mode` or `service.name` to isolate surfaces.
