# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Architecture patterns that compound — decisions that make future features easier
- Silent success mitigation lessons: ~7-10% of background spawns return no text, mitigated by RESPONSE ORDER block + filesystem checks
- Reviewer rejection lockout enforcement: if Keaton/Hockney/Baer rejects, original author is locked out
- Proposal-first workflow: docs/proposals/ before execution for meaningful changes
- 13 modules: adapter, agents, build, casting, cli, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools
- Distribution: GitHub-native (npx github:bradygaster/squad), never npmjs.com
- v1 docs are internal only — no published docs site

### 2026-02-21: Interactive Shell Proposal
- **Problem:** Copilot CLI dependency creates unreliable handoffs, zero agent visibility, and external UX control
- **Solution:** Squad becomes its own REPL/shell — users launch `squad` with no args, enter interactive session
- **Architecture decision:** Copilot SDK as LLM backend (streaming, tool dispatch), Squad owns spawning + coordination UX
- **Terminal UI:** Recommend `ink` (React for CLIs) — battle-tested, component model, testable, cross-platform
- **No breaking changes:** All subcommands (init, watch, export) unchanged; squad.agent.md still works for Copilot-native users
- **Wave restructure:** This becomes Wave 0 (foundation) — blocks distribution (Wave 1), SquadUI (Wave 2), docs (Wave 3)
- **Key decisions needed:** ink vs. alternatives, session-per-agent vs. pooling, background cleanup strategy
- **File paths:** docs/proposals/squad-interactive-shell.md (proposal), GitHub issue #232 (epic tracking)
- **Pattern:** When product direction shifts, invalidate existing wave structure and rebuild from foundation

### 2026-02-21: SDK/CLI Split Architecture Decision
- **Problem:** All 114 .ts files live in root `src/`. Workspace packages `squad-sdk` and `squad-cli` are published stubs. Need to move real code into them.
- **Analysis:** Dependency flow is strictly CLI → SDK → @github/copilot-sdk. No circular deps. No SDK module imports from CLI. Clean DAG.
- **Architecture decision:** SDK gets 15 directories + 4 standalone files (adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils, index.ts, resolution.ts, parsers.ts, types.ts). CLI gets `src/cli/` + `src/cli-entry.ts`. Root becomes workspace orchestrator only.
- **Key call:** Remove CLI utility re-exports (`success`, `error`, `fatal`, `runInit`, etc.) from SDK barrel. These leaked CLI implementation into the library surface. Breaking change — correct and intentional.
- **Key call:** `ink` and `react` are CLI-only deps. SDK has zero UI dependencies.
- **Migration order:** SDK first (CLI depends on it), CLI second (rewrite imports to package names), root cleanup third.
- **Exports map:** SDK subpath exports expand from 7 to 18 entries — every module independently importable.
- **File path:** `.squad/decisions/inbox/keaton-sdk-cli-split-plan.md`
- **Pattern:** One-way dependency graphs enable independent package evolution. SDK stays pure library; CLI stays thin consumer.

### 📌 Team update (2026-02-22T041800Z): SDK/CLI split plan executed, versions aligned to 0.8.0, 1719 tests passing
Keaton's split plan produced definitive SDK/CLI mapping with clean DAG (CLI → SDK → @github/copilot-sdk). Fenster migrated 154 files across both packages. Edie fixed all 6 config files (tsconfigs with composite builds, package.json exports maps). Kobayashi aligned all versions to 0.8.0 (clear break from 0.7.0 stubs). Hockney verified build clean + all 1719 tests pass, deferred test import migration until root src/ removal. Rabin verified publish workflows ready. Coordinator published both packages to npm (0.8.0). Inbox merged to decisions.md. Ready for Phase 3 (root cleanup).
