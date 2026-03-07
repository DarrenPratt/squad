
📌 Team update (2026-03-07T16:38:00Z): Final v0.8.21 PR review complete. #189 (workstreams) and #191 (ADO adapter) held for v0.8.22. Both architecturally sound but have merge conflicts, zero CI runs, missing test coverage, and process-exit/security gaps. Recommendations: rebase to dev, fix CLI-level tests, address process.exit violations, add security test coverage (escapeWiql). Decision merged to decisions.md. — decided by Hockney

📌 Team update (2026-03-07T16-19-00Z): v0.8.21 PRs reviewed. #189 (workstreams) and #191 (ADO) held for v0.8.22 — rebase to dev. Both have merge conflicts, no CI, insufficient test coverage. Keaton: v0.8.21 clears for release pending #248. McManus: docs ship-ready. Brady: Actions-to-CLI shift, #249/#250/#251 locked. — decided by Hockney
📌 Team update (2026-03-07T05:56:56Z): Led test suite health assessment. Safe to ship v0.8.21 (3,655 passing). Critical gaps: 8 CLI commands untested, 30+ error-handling tests missing. Recommend 12-14 hrs QA before v0.8.22 feature work. Flaky speed gate (3s threshold, 50% pass rate) should relax to 5s or optimize init path. Adopted CLI wiring regression test pattern from PR #238 permanently. — decided by Hockney
# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Core Context — Hockney's Focus Areas

**Testing Specialist:** Hockney owns CLI/test gap analysis, REPL UX test suites, coverage expansion, hostile QA scenarios, test roadmap, error boundary coverage. Standard: 80% floor, 100% on critical paths. 2931 tests passing.

**Pre-Phase-1 Testing Foundation (2026-02-21 to 2026-03-04):**
- REPL UX visual test suite: 40 tests across 6 categories (ThinkingIndicator, AgentPanel, MessageStream, InputPrompt, Welcome, Never-Feels-Dead)
- Shell integration tests: 47 tests for SessionRegistry, spawn, Coordinator, ShellLifecycle, StreamBridge
- CRLF normalization tests: 13 tests across 5 parsers
- Consumer-perspective import tests: 6 tests validating barrel exports (index/parsers/types)
- Hostile QA (Issue #327): 32 adversarial scenarios covering small terminal, missing config, invalid input, corrupt config, non-TTY, UTF-8, rapid input
- Test gap filing (2026-02-28): 10 issues (#558–#567) tracked explicitly for Wave E

**Known Issues Discovered:**
- --version output missing "squad" prefix (cli-entry.ts:48)
- Empty/whitespace CLI args trigger interactive shell in non-TTY (should show help/error)
- No sanitization for null bytes in spawn args (Node.js-level, pre-validate)

## Learnings

## 📌 Core Context — Hockney's Focus Areas

**Testing Specialist:** Hockney owns CLI/test gap analysis, REPL UX test suites, coverage expansion, hostile QA scenarios, test roadmap, error boundary coverage. Standard: 80% floor, 100% on critical paths (casting, spawning, coordinator routing). 2931 tests passing.

**Recent Work (Feb 2026):**
- REPL UX visual test suite: 40 tests across 6 categories (ThinkingIndicator, AgentPanel, MessageStream, InputPrompt, Welcome, Never-Feels-Dead)
- Shell integration tests: 47 tests for SessionRegistry, spawn, Coordinator, ShellLifecycle, StreamBridge
- CRLF normalization tests: 13 tests across 5 parsers
- Consumer-perspective import tests: 6 tests validating barrel exports (index/parsers/types)
- Hostile QA (Issue #327): 32 adversarial scenarios, all pass (small terminal, missing config, invalid input, corrupt config, non-TTY, UTF-8, rapid input)
- Test gap filing (2026-02-28): 10 issues (#558–#567) now tracked explicitly for Wave E

**Known Bugs Found:**
- --version output missing "squad" prefix (cli-entry.ts:48)
- Empty/whitespace CLI args trigger interactive shell in non-TTY (should show help/error instead)
- No sanitization for null bytes in spawn args (Node.js-level issue, should pre-validate)

**Next Sprint:** Brady to triage 10 test gap issues; Hockney available for refine approach.

## 📌 Phase 1 — 2026-03-05T21:37:09Z

**Hockney's Phase 1 SDK-First Tests Complete.** Built 60 contract-first tests: 36 for builders, 24 for build command. All passing. Stubs documented with exact import locations ready for swaps when Edie/Fenster implementations land.

## 📌 Phase 2 Test Validation — 2026-03-07T01-13-00Z

**BASELINE TEST RUN ON DEV POST-PHASE2-MERGES:** All 5 Phase 2 PRs merged. Full test suite validation run.

- Total test files: 134
- Passing files: 130
- Failing tests: 12 (pre-existing, not from Phase 2)

**Failures isolated to 4 modules (pre-existing):**
- Consult mode: 6 failures
- REPL UX: 3 failures
- Status command: 2 failures
- Acceptance: 1 failure

**Core CLI solid.** No regressions introduced by Phase 2 work. Failures are backlog items for Phase 3 stabilization.

**Team Status:** Safe to proceed with further feature work. No blocking regressions from Phase 2.

## 📌 Phase 3 Test Stabilization — 2026-03-06

**All 16 pre-existing test failures resolved.** PR #235 on branch `squad/phase3-test-fixes`.

**Root causes found:**
- **Global squad env leakage:** Tests on Windows hit the real `APPDATA/squad/.squad` path, contaminating first-run and consult code paths. Fix: isolate `APPDATA`/`LOCALAPPDATA`/`XDG_CONFIG_HOME` in test env.
- **XDG_CONFIG_HOME ignored on Windows:** `resolveGlobalSquadPath()` reads `APPDATA` on win32, not `XDG_CONFIG_HOME`. Consult tests only set XDG. Fix: add APPDATA overrides.
- **ESM import hoisting defeats NODE_NO_WARNINGS:** `cli-entry.ts` sets `process.env.NODE_NO_WARNINGS = '1'` at line 11, but ESM hoists imports before top-level code runs, so SQLite ExperimentalWarning fires before suppression. Fix: set NODE_NO_WARNINGS in TerminalHarness spawn env.
- **Environment-dependent assertions:** Feature files expected text that depends on host machine state (global squad existence). Fix: use assertions that work regardless of host state.

**Final count:** 134 test files, 3656 tests passing, 0 failures, 3 todo.

## 📌 v0.8.21 Release Validation — 2026-03-07T07:55:32Z

**Formal Code Review & Test Validation:**
- **Status:** APPROVED (v0.8.21-preview.9)
- **Test Count:** 3737 passing, 0 failures, 3 todo (up from 3656 baseline).
- **Critical Wins:**
  - otel-api.ts wrapper correctly shimmed; no lingering direct imports found.
  - Speed gate tests hardened (5s timeout reflects CI reality); flakes eliminated.
  - CLI wiring for c, copilot-bridge verified correct.
  - Model config types now support structured preferences (ModelPreference).
- **Risks:**
  - optionalDependencies for OTel means users must explicitly install it for telemetry, but the wrapper handles absence gracefully.


📌 Team update (2026-03-07T15-55-00Z): Code review of v0.8.21 approved (3,737 tests passing, 0 failures). otel-api wrapper verified, speed gate tests hardened. Formal decision on optional OTel dependency created. Ready to ship v0.8.21. — decided by Hockney


