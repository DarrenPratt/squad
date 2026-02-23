# Decision: P0 Bug Fixes from Phase 1 Testing

**By:** Hockney (Tester)
**Date:** 2026-02-23
**Issue:** #333
**PR:** #351

## Decisions Made

### BUG-2: Empty/whitespace args behavior
**Decision:** Empty string and whitespace-only CLI args show brief help text and exit 0.
**Rationale:** Previously, `squad ""` launched the interactive shell in non-TTY mode (exit 1), and `squad "   "` hit the "Unknown command" error. Neither is useful. Showing help is the least-surprise behavior and matches how most CLI tools handle garbage input.
**Implementation:** Trim `args[0]` early; if raw arg was provided but trims to empty, show help instead of routing to shell or command dispatch.

### BUG-1: --version bare semver is correct
**Decision:** No code change needed. Bare semver from `--version` is intentional per Cheritto's P0 UX fix (PR #349) and Marquez's audit.
**Action:** Updated `version.feature` acceptance test which still asserted `output contains "squad"` — this conflicted with the `ux-gates.test.ts` gate that explicitly verifies no "squad" prefix.

### version.feature was stale
**Observation:** Acceptance tests can drift from UX decisions when multiple PRs change the same behavior. The version.feature file was written before the P0 UX decision to use bare semver, and nobody caught the conflict because the acceptance tests run separately from UX gate tests.
**Recommendation:** Run both acceptance AND ux-gates tests in CI as a single quality gate to catch drift.

## For Team Awareness
- 3 pre-existing test failures in `repl-ux.test.ts` (AgentPanel empty-state rendering). Not introduced by this PR — Kovash's component changes made the old assertions stale. Someone should update those tests.
