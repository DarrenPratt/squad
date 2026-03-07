📌 Team update (2026-03-07T16:38:00Z): Actions→CLI RFC filed (#252). Community-facing PRD published with problem statement, tiered model (Tier 1: zero-actions, Tier 2: opt-in, Tier 3: enterprise), phased migration plan (v0.8.22 CLI+deprecation, v0.8.23 cleanup, v0.9.0 remove), backward compatibility, and 7 feedback questions. Decisions merged to decisions.md. — decided by Keaton

📌 Team update (2026-03-07T16:25:00Z): Actions → CLI migration strategy finalized. 4-agent consensus: migrate 5 squad-specific workflows (12 min/mo) to CLI commands. Keep 9 CI/release workflows (215 min/mo, load-bearing). Zero-risk migration. v0.8.22 quick wins identified: squad labels sync + squad labels enforce. Phased rollout: v0.8.22 (deprecation + CLI) → v0.9.0 (remove workflows) → v0.9.x (opt-in automation). Brady's portability insight captured: CLI-first means Squad runs anywhere (containers, Codespaces). Customer communication strategy: "Zero surprise automation" as competitive differentiator. Decisions merged. — coordinated by Scribe

📌 Team update (2026-03-07T16-19-00Z): Pre-release triage complete. v0.8.21 releases cleanly pending #248 fix. v0.8.22 roadmap well-scoped (9 issues, 3 streams). Close #194 (completed) and #231 (duplicate). Brady directive: #249, #250, #251 locked for v0.8.22. Actions-to-CLI directive received (move 5 squad workflows to CLI). — decided by Keaton
📌 Team update (2026-03-07T05:56:56Z): Led full issue triage (22 open issues). P0/P1/P2/P3 prioritization complete. v0.8.22 target = 11 issues (5 fix-now + 6 next-wave); 11 deferred to v0.8.23+. Key decisions: CLI audit batch (#237/#236), model config priority (#223 > #205), migration wave grouping (#197/#231/#126), hub repo feature (#242). — decided by Keaton
# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Core Context — Keaton's Focus Areas

**Architectural & Planning Lead:** Keaton owns proposal-first workflow, SDK/CLI split design, observability patterns, wave planning and readiness assessments, cleanup audits, public release decisions. Pattern: decisions that compound — each architectural choice makes future features easier.

**Pre-Phase-1 Architecture (2026-02-21 to 2026-03-04):**
- SDK/CLI split executed: 154 files migrated, clean DAG (CLI → SDK → Copilot SDK)
- Proposal-first workflow established in docs/proposals/
- Type safety decision (strict: true, noUncheckedIndexedAccess: true)
- Hook-based governance (security, PII, file-write guards)
- Runtime target: Node.js ≥20, ESM-only, streaming-first
- Merge driver for append-only files (.gitattributes union strategy)
- Zero-dependency scaffolding preserved (cli.js thin, zero runtime deps)
- Casting — The Usual Suspects team names permanent
- User directive — Interactive Shell as Primary UX
- Distribution: npm-only (GitHub-native path removed)
- Coordinator prompt: Three routing modes (DIRECT, ROUTE, MULTI)
- CLI entry point split: index.ts pure barrel, cli-entry.ts contains main()
- Process.exit() refactor: library-safe (fatal() throws SquadError)
- Docs: Tone ceiling enforced (no hype, substantiated claims)

**Pre-Phase-1 Wave Completion (2026-02-22 to 2026-03-05):**
- Waves A–D completion verified: 30 issues closed, 2930→2931 tests passing
- Wave D readiness assessment + 6 issues filed (#488–#493)
- Public release readiness verdict: 🟡 ready with caveats (dogfood #324, architecture docs needed)
- Issue #306 cleanup audit: 47 findings catalogued (18 hardcoded, 16 code quality, 8 tests, 5 UX)
- Runtime EventBus established as canonical: colon-notation (session:created), error isolation
- Subpath exports in SDK with types-first condition ordering
- User directive — Aspire testing requirements (OTel telemetry validation)
- User directive — Code fences: backticks only (no / or \)
- User directive — Docs overhaul with publication pause until Brady's approval
- REPL cancellation and configurable timeout (SQUAD_REPL_TIMEOUT)
- Shell observability metrics under squad.shell.* namespace
- Telemetry in both CLI and agent modes

## Learnings

## 📌 Phase 1 Completion — 2026-03-05T21:37:09Z

**PHASE 1 SDK-FIRST COMPLETE.** Keaton's scoping decision + Edie's builders + Fenster's CLI + Hockney's tests + Kujan's OTel assessment + Verbal's coordinator update. 6 agents fanned out in parallel.

**Team Cross-Pollination:**
- **Edie:** Built 8 builder functions + type surface in packages/squad-sdk/src/builders/. Zero new deps. Runtime validation included. Type unification: runtime/config.ts canonical.
- **Fenster:** Implemented squad build --check CLI command. Works with SquadSDKConfig. Generated files stamped with HTML headers. Wired into cli-entry.ts.
- **Hockney:** 60 contract-first tests (36 builders, 24 build command). All passing. Stubs in place.
- **Kujan:** OTel readiness: all 8 runtime modules compile cleanly. Phase 3 unblocked.
- **Verbal:** Coordinator prompt updated with SDK Mode Detection section. Session-start heuristic for squad/ or squad.config.ts.

**Next:** Phase 2 (scaffolding + markdown generation), Phase 3 (SDK runtime + OTel), Phase 4 (migrations).

## 📌 Phase 2 Community PR Merges — 2026-03-07T01-13-00Z

**PHASE 2 COMMUNITY PR MERGES COMPLETE.** Brady approved 3 community PRs from external contributors. All merged to dev successfully.

- PR #230 (EmmittJ): CLI wire-up for squad link + squad init --mode remote (6d0bd56)
- PR #217 (williamhallatt): TUI /init no-args flow fix (20970f9)
- PR #219 (williamhallatt): Fork contribution workflow docs in CONTRIBUTING.md (157b8c0)

**Zero conflicts.** All three showed UNSTABLE merge state (dev progressed past their base), but all merged cleanly. Fork-first contributor procedure now standardized. 52+ tests passing.

**Team Status:** External contributors now viable for parallel work. Merge conflicts due to base drift, not code — low friction, normal pattern. Fork-first procedure repeatable.

📌 Team update (2026-03-07T15-55-00Z): v0.8.21 approved for release (Hockney: test validation passed; McManus: blog published). SDK-First init/migrate features remain deferred to v0.8.22 per previous decision. — coordinated by Scribe

## 📌 Actions → CLI Migration Strategy — 2026-03-07T17:30:00Z

**STRATEGIC ANALYSIS COMPLETE.** Brady raised concern about Squad's automated GitHub Actions consuming API quota and surprising users with automation. Keaton analyzed all 15 workflows.

**Classification:**
- **🟢 KEEP (10 workflows):** Standard CI/CD (squad-ci, squad-release, squad-promote, squad-main-guard, squad-preview, squad-docs, publish, squad-publish, squad-insider-release, squad-insider-publish)
- **🟡 MIGRATE TO CLI (5 workflows):** Squad-specific automation (sync-squad-labels, squad-triage, squad-issue-assign, squad-heartbeat, squad-label-enforce)

**Migration Path:**
- **v0.8.22:** Add deprecation warnings + implement CLI commands (`squad labels sync`, `squad triage`, `squad assign`, `squad watch`, `squad labels check`)
- **v0.9.0:** Remove 5 squad-specific workflows entirely. CLI-first is the only path.
- **Post-v0.9.0:** Add opt-in automation for users who want it (they install a workflow that calls CLI commands)

**Zero Actions Required Vision:** Squad can work with ONLY 3 standard workflows (CI, release, docs). All Squad logic moves to CLI commands that users invoke explicitly.

**Core Principle:** Squad should be a CLI-first tool that users control, not an automation layer that surprises them. Users invoke Squad when they want it — no background automation without explicit opt-in.

**Document:** `.squad/decisions/inbox/keaton-actions-to-cli-strategy.md` — full analysis with tradeoffs, UX design, technical approach, and implementation roadmap.

## 📌 Actions → CLI RFC Filed — 2026-03-07T18:00:00Z

**RFC ISSUE FILED.** Created [#252](https://github.com/bradygaster/squad/issues/252) — comprehensive PRD for migrating Squad automation from GitHub Actions to CLI commands. Community-facing RFC with full problem statement, tiered model (Tier 1: zero-actions default, Tier 2: opt-in, Tier 3: enterprise), migration plan across v0.8.22/v0.8.23/v0.9.0, backward compatibility guarantees, and 7 specific feedback questions. References #248 (triage wiring) and #236 (persistent watch). Labels: `type:rfc`, `priority:p1`. Reflects unanimous team consensus from 4-agent analysis session.


