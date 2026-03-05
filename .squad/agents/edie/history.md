# Project Context

📌 Team update (2026-02-23T07:24Z): Docs overhaul directive and publication pause — decided by Brady
Brady has issued consolidated directive on docs redesign: trim scope, adopt lighthearted voice (match original Squad beta tone), prioritize first-experience over tech depth, consolidate references, and pause all live publication until explicit go-ahead. All docs should be brief, prompt-first, action-oriented, and human-toned. This replaces stuffy enterprise-style documentation.


- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Strict mode non-negotiable: strict: true, noUncheckedIndexedAccess: true, no @ts-ignore
- Declaration files are public API — treat .d.ts as contracts
- Generics over unions for recurring patterns
- ESM-only: no CJS shims, no dual-package hazards
- Build pipeline: esbuild for bundling, tsc for type checking
- Public API: src/index.ts exports everything — this is the contract surface

### SDK npm swap (M0 blocker)
- Swapped `@github/copilot-sdk` from `file:../copilot-sdk/nodejs` (v0.1.8) to npm `^0.1.25`
- Kept in `optionalDependencies` to preserve zero-dependency CLI scaffolding path
- Build clean, 1592/1592 tests passed — no code changes needed, only package.json + lockfile
- PR #271, branch `squad/190-sdk-npm-dependency`, closes #190, #193, #194

### 📌 Team update (2026-02-21T21:23Z): SDK dependency can be swapped from file: to npm reference — decided by Kujan
The `file:../copilot-sdk/nodejs` reference can be upgraded to `"@github/copilot-sdk": "^0.1.25"` (already published on npm with SLSA attestations). This is a one-line change; build and all 1592 tests verified to pass. This unblocks npm publish and removes CI sibling-directory dependency.

### M1 Monorepo scaffold (#197, #198, #200)
- Added `"workspaces": ["packages/*"]` to root package.json
- Created `packages/squad-sdk/package.json` — `@bradygaster/squad-sdk`, ESM-only, exports map with types-first condition, `@github/copilot-sdk` as real dependency (not optional — SDK owns this dep now)
- Created `packages/squad-cli/package.json` — `@bradygaster/squad-cli`, bin entry, workspace dep on SDK
- npm uses version-string workspace references (current: `"0.8.18-preview"`) not `workspace:*` protocol (that's pnpm/Yarn) [CORRECTED: was `"0.6.0-alpha.0"`, stale reference to intermediate dev version]
- Build clean, 1592/1592 tests still pass — no source files moved, scaffold only
- PR #274, branch `squad/197-monorepo-scaffold`, closes #197, #198, #200

### CLI entry point split (#187)
- Moved `main()` and all CLI bootstrap code from `src/index.ts` to `src/cli-entry.ts`
- `src/index.ts` is now a pure re-export barrel with zero side effects — safe for library import
- `VERSION` stays exported from `index.ts` (public API); `cli-entry.ts` imports it
- `SquadError` added to barrel exports so library consumers can catch CLI errors
- `cli-entry.ts` imports `VERSION` from `./index.js` — no duplicate constant
- Build clean, 1683/1683 tests pass
- Branch `squad/181-squadui-p0`, closes #187

### 📌 Team update (2026-02-22T020714Z): CLI entry point split complete
Edie's refactor split src/index.ts into pure barrel (zero side effects) and src/cli-entry.ts (CLI routing + main). SquadUI can now safely import @bradygaster/squad as a library without triggering process.exit() on import. Decision merged to decisions.md. Issue #187 closed. 1683 tests passing. Related: Kujan's process.exit() refactor.

### Subpath exports (#227)
- Added 7 subpath exports to `packages/squad-sdk/package.json`: `.`, `./parsers`, `./types`, `./config`, `./skills`, `./agents`, `./cli`
- Every export uses types-first condition ordering (`"types"` before `"import"`) per Node.js resolution algorithm
- All source barrels verified: `src/parsers.ts`, `src/types.ts`, `src/config/index.ts`, `src/skills/index.ts`, `src/agents/index.ts`, `src/cli/index.ts`
- All dist artifacts confirmed after build: `.js` + `.d.ts` for each subpath
- Build clean, 1719/1719 tests pass
- Branch `squad/181-squadui-p2`, closes #227

### Build system migration (monorepo tsconfig + package.json)
- Converted root `tsconfig.json` to base config with `"files": []` and project references to both workspace packages
- SDK `tsconfig.json`: extends root, `composite: true`, `declarationMap: true`, `include: ["src/**/*.ts"]` — no JSX
- CLI `tsconfig.json`: extends root, `composite: true`, `jsx: "react-jsx"`, `jsxImportSource: "react"`, includes `*.tsx`, project reference to SDK
- SDK `package.json`: 18 subpath exports (Keaton's plan), `@github/copilot-sdk` as dependency, `@types/node` + `typescript` as devDeps
- CLI `package.json`: `bin.squad` → `./dist/cli-entry.js`, added `ink`, `react` deps, `@types/react`, `esbuild`, `ink-testing-library` devDeps, `templates/` in files array
- Root `package.json`: stripped to workspace orchestrator — `private: true`, no `main`/`types`/`bin`, no runtime deps, only `typescript` + `vitest` in devDeps, build script delegates to `--workspaces`
- `composite: true` required in both packages for TypeScript project references to work — without it, `tsc --build` cannot resolve cross-package references
- Build clean: both `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` compile with zero errors

### 📌 Team update (2026-02-22T041800Z): Build system migration complete, all 6 config files fixed, zero TypeScript errors — decided by Edie
Edie fixed root tsconfig (base config + project refs), SDK tsconfig (composite + no JSX), CLI tsconfig (composite + jsx), root package.json (workspace orchestrator), SDK package.json (18 subpath exports), CLI package.json (bin entry + UI deps). Composite builds enable TypeScript project references across packages. All dist artifacts (`.js`, `.d.ts`, `.d.ts.map`) emitted correctly. Build ready for Phase 3 (test import migration when root src/ removal blocks).

### Fix workspace:* → npm-compatible wildcard
- Previous commit used `workspace:*` for CLI→SDK dependency — this is pnpm/Yarn syntax, not npm
- npm workspaces reject `workspace:` protocol with `EUNSUPPORTEDPROTOCOL`
- Changed to `"*"` which achieves the same local resolution under npm workspaces
- Verified: `npm install` succeeds, `npm run build` compiles both packages cleanly
- Also verified: prepublishOnly scripts and dynamic VERSION (via createRequire) from previous commit are working correctly

### 📌 Team update (2026-02-22T08:50:00Z): CharterCompiler reuses parseCharterMarkdown — decided by Edie
CharterCompiler.compile() delegates to existing parseCharterMarkdown() rather than duplicate parsing logic. Single source of truth. AgentSessionManager accepts optional EventBus injection — when present, spawn() emits session.created; when absent, manager works silently. Improves testability.

### 📌 Team update (2026-02-22T070156Z): npm workspace protocol decision merged, test import migration complete, barrel conventions finalized — decided by Edie, Fenster, Hockney
- **npm workspace protocol (Decision):** Use `"*"` version string for CLI→SDK dependency, not pnpm's `workspace:*`. npm workspaces auto-resolve local packages by name regardless of version specifier.
- **Test import migration (Decision):** 56 test files successfully migrated from `../src/` to `@bradygaster/squad-sdk` / `@bradygaster/squad-cli` package paths. 26 SDK subpath exports + 16 CLI subpath exports. All 1727 tests passing. Vitest resolves through compiled `dist/`.
- **Barrel file conventions (Decision):** `src/parsers.ts` and `src/types.ts` created as public API barrels — parsers re-export all functions + types, types exports ONLY types (zero runtime imports). Both follow ESM barrel pattern.
- **All decisions merged to decisions.md.** Status: Production-ready, awaiting Phase 3 SDK session integration for final runtime wiring.

### CharterCompiler + AgentSessionManager implementation (PRD 4)
- `CharterCompiler.compile()` reads charter.md from disk, delegates markdown parsing to existing `parseCharterMarkdown()` from `charter-compiler.ts` — no duplicate parsing logic
- `CharterCompiler.compileAll()` uses `readdir` with `withFileTypes` to enumerate `.squad/agents/*/charter.md`, skips `scribe` and `_alumni/` dirs
- `AgentSessionManager` accepts optional `EventBus` from `../client/event-bus.js` — emits `session.created` and `session.destroyed` lifecycle events
- `spawn()` uses `crypto.randomUUID()` for session IDs, `resume()` throws on unknown agent, `destroy()` emits event before removing from map
- Key file: `packages/squad-sdk/src/agents/index.ts` — barrel re-exports from submodules remain intact, only class stubs replaced
- EventBus event types: `session.created`, `session.destroyed` (from `SquadEventType` union in `client/event-bus.ts`)
- All 1727 tests pass, build clean

### OpenTelemetry dependency wiring (#254)
- Added `@opentelemetry/api` as optional peer dep (`^1.9.0`) with `peerDependenciesMeta` marking it optional — and in devDependencies so tsc can resolve types during build
- Added 8 OTel packages as `optionalDependencies`: `sdk-node`, `sdk-trace-node`, `sdk-trace-base`, `sdk-metrics`, `exporter-trace-otlp-http`, `exporter-metrics-otlp-http`, `resources`, `semantic-conventions`
- Critical version alignment: `sdk-node@0.57.x` depends on the `1.30.x` core line (`sdk-trace-base`, `sdk-trace-node`, `sdk-metrics`, `resources`). Pinning these in optionalDependencies prevents npm from hoisting 2.x to the top level and causing type mismatches between duplicate `@opentelemetry/sdk-trace-base` versions
- Fortier's `src/runtime/otel.ts` (issue #255) was already in place with full TracerProvider/MeterProvider implementation — no stub needed
- Build clean, 1832/1832 pre-existing tests pass (Fortier's 36 OTel tests fail due to no local OTLP collector, pre-existing condition)

### Token usage + session pool metrics wiring (#261, #263)
- Wired `recordTokenUsage(event)` into `StreamingPipeline.processEvent()` — fires after `dispatchUsage()` in the `usage` case, merged import with existing otel-metrics imports
- Wired `recordSessionCreated()`, `recordSessionClosed()`, `recordSessionError()` into `SquadClient.createSession()` and `deleteSession()` — success paths get created/closed, inner catch blocks get error
- Barrel export (`src/index.ts` line 30) and package.json subpath export (`./runtime/otel-metrics`) already present — no changes needed
- Build clean, 1886/1886 tests pass

### 📌 Team update (2026-02-22T093300Z): OTel Phase 2 complete — session traces, latency metrics, tool enhancements, agent metrics, token usage wiring, metrics tests — decided by Fortier, Fenster, Edie, Hockney
All four agents shipped Phase 2 in parallel: Fortier wired TTFT/duration/throughput metrics. Fenster established tool trace patterns and agent metric wiring conventions. Edie wired token usage and session pool metrics. Hockney created spy-meter test pattern (39 new tests). Total: 1940 tests passing, metrics ready for production telemetry.

### Constants extraction — single source of truth for models, timeouts, roles
- Created `packages/squad-sdk/src/runtime/constants.ts` with `MODELS`, `TIMEOUTS`, `AGENT_ROLES` (all `as const`)
- Updated 6 consumer files: `model-selector.ts`, `config.ts`, `health.ts`, `init.ts`, `plugin.ts`, `index.ts`
- Discovered drift: config.ts had 3-entry fallback chains vs model-selector's 4-entry chains. Consolidated to the complete 4-entry chains from model-selector (the runtime source of truth)
- Used named exports `{ MODELS, TIMEOUTS, AGENT_ROLES }` in barrel to avoid `AgentRole` name collision with casting module's separate `AgentRole` type
- Spread `[...MODELS.FALLBACK_CHAINS.tier]` pattern converts `readonly` tuples to mutable `string[]` for interface compat — avoids changing public interfaces
- Environment variable overrides (`SQUAD_DEFAULT_MODEL`, `SQUAD_HEALTH_CHECK_MS`, `SQUAD_GIT_CLONE_MS`, `SQUAD_PLUGIN_FETCH_MS`) enable runtime config without code changes
- Build clean, 2138 tests pass (3 failures pre-existing Docker/Aspire infra)

### squad doctor command (#312)
- Created `packages/squad-cli/src/cli/commands/doctor.ts` — typed DoctorCheck interface with `'pass' | 'fail' | 'warn'` status union
- Mode detection: local (default), remote (config.json teamRoot), hub (squad-hub.json)
- 9 checks: .squad/ dir, config.json validity, team root resolution, team.md ## Members, routing.md, agents/ dir (with count), casting/registry.json, decisions.md, absolute path warning
- Registered via lazy `import()` in cli-entry.ts — same pattern as export/aspire/plugin commands
- Added subpath export `./commands/doctor` in CLI package.json (types-first condition)
- Exit code always 0 — doctor is diagnostic, never a gate
- 8 tests: healthy local, empty dir failures, remote mode detection, hub mode, local mode, absolute path warning, missing ## Members, invalid JSON
- Build clean, all 8 doctor tests pass

### ensureSquadPathDual() — dual-root write support (#314)
- Added `ensureSquadPathDual(filePath, projectDir, teamDir)` to `packages/squad-sdk/src/resolution.ts` — validates that a write target is inside either root or the system temp directory
- Added `ensureSquadPathResolved(filePath, paths)` convenience wrapper that takes a `ResolvedSquadPaths` object
- Existing `ensureSquadPath()` unchanged — full backward compatibility
- Both new functions exported from `src/index.ts` barrel
- 13 tests in `test/ensure-squad-path-dual.test.ts`: local mode, remote mode (both roots), rejection, traversal attacks, subdirs, exact roots, temp dir, ResolvedSquadPaths wrapper
- Build clean, 13 new tests + 21 existing resolution tests all pass

### Unsafe cast elimination in adapter layer (#318, #320, #321, #322)
- Replaced `as unknown as SquadSessionMetadata[]` in `listSessions()` with explicit field-mapping — picks `sessionId`, `startTime`, `modifiedTime`, `summary`, `isRemote`, `context` from SDK result
- Applied same field-mapping pattern to `getStatus()`, `getAuthStatus()`, `listModels()` — all now pick only the fields defined in our types instead of passing SDK objects through
- Created `SquadClientEventType`, `SquadClientEvent`, `SquadClientEventHandler` in `adapter/types.ts` — client-level lifecycle events distinct from session-level events
- `SquadClient.on()` now uses generic `<K extends SquadClientEventType>` overload matching the SDK's `SessionLifecycleEventType` — zero `as any` casts
- `SquadClientWithPool.on()` typed with matching overloads, pool event bridge uses typed `Record<string, SquadEventType>` mapping instead of `as any`
- Removed dead `_squadOnMessage` reference in `sendMessage()` — was reading a property never set on any session
- Fixed `(event as any).inputTokens` / `outputTokens` with typed index access via `SquadSessionEvent`'s `[key: string]: unknown` signature
- Added `sendAndWait()`, `abort()`, `getMessages()` as optional methods on `SquadSession` interface and implemented in `CopilotSessionAdapter`
- Verified `resumeSession()` already wraps in `CopilotSessionAdapter` — no fix needed for #320
- Updated test assertions: `listSessions` now checks `.sessionId` not `.id`, `getStatus` checks `.protocolVersion` not `.uptime`, `getAuthStatus` checks `.isAuthenticated`/`.login` not `.authenticated`/`.user`
- 3 new tests for optional adapter methods (`sendAndWait`, `abort`, `getMessages`)
- Build clean, 2219/2219 tests pass, zero `as any` or `as unknown as` remain in adapter layer

### Public readiness assessment (Brady's request)
- **TypeScript strictness:** Root tsconfig.json has `strict: true` enabled, all strict family flags on except `noUncheckedIndexedAccess` (missing — medium risk)
- **Type quality:** Found ~26 `any` usages across codebase — most defensible (adapter layer bridging untyped SDK, recursive scrubbing), but coordinator has loose config casting that should be tightened
- **No @ts-ignore:** Zero suppressions found — clean
- **Public API surface:** `packages/squad-sdk/src/index.ts` is clean barrel with 43 named exports, zero side effects. All exports have corresponding .d.ts files
- **Declaration files:** 18 subpath exports, all have types-first condition ordering. Declaration maps enabled. Source maps present
- **ESM compliance:** package.json has `"type": "module"`, all exports use `.js` extensions in import paths, no CJS detected in dist/
- **Build output:** Both SDK and CLI compile with zero errors (`npx tsc --noEmit` clean), dist/ contains .js + .d.ts + .d.ts.map + .js.map for all modules
- **Consumer experience:** Import path `@bradygaster/squad-sdk` resolves to typed barrel, autocomplete will work, 18 subpath exports for tree-shaking
- **Breaking change risk:** Constants module (`MODELS`, `TIMEOUTS`, `AGENT_ROLES`) exported as `as const` tuples — changing these would break consumers. Adapter types are stable
- **Verdict:** 🟡 Ready with caveats — missing `noUncheckedIndexedAccess` (array access can return undefined, not type-checked), some loose any casts in coordinator config mapping. For M1 public release, recommend adding `noUncheckedIndexedAccess: true` and tightening coordinator/routing config types. All other type quality markers are green

### 2026-02-24T17-25-08Z : Team consensus on public readiness
📌 Full team assessment complete. All 7 agents: 🟡 Ready with caveats. Consensus: ship after 3 must-fixes (LICENSE, CI workflow, debug console.logs). No blockers to public source release. See .squad/log/2026-02-24T17-25-08Z-public-readiness-assessment.md and .squad/decisions.md for details.

### History Audit — 2026-03-03
**Audit performed by:** Edie (mirror moment - team-wide history hygiene check)
**Findings:**
- 1 stale version reference corrected: Line 35 M1 Monorepo section recorded intermediate version `"0.6.0-alpha.0"` instead of current final version `"0.8.18-preview"` (target: v0.8.17+ per decisions). This violated history-hygiene SKILL (record final outcomes, not intermediate requests).
- No conflicting entries detected.
- No reversed decisions detected.
- No intermediate states recorded as final (except the above version ref).
- All decisions match .squad/decisions.md consensus.
- Confidence: High. History now reflects ground truth for future spawns.

### Workflow filter type validation — #201 investigation
- Validated PR `williamhallatt/201-investigate-actions-install` for TypeScript correctness
- Change: `FRAMEWORK_WORKFLOWS` array filters workflows to only Squad framework files (4 entries)
- **Type inference:** `const FRAMEWORK_WORKFLOWS = [...]` correctly infers as `string[]`. `Array.prototype.includes(value: string)` accepts `string` from `readdirSync().filter()` with zero issues
- **Build:** `npm run build` passes cleanly with zero errors. All `.d.ts` files emit correctly
- **Lint:** `npm run lint` (noEmit check) passes cleanly
- **Strict mode compliance:** Root tsconfig has `strict: true` + `noUncheckedIndexedAccess: true`. The constant is module-scoped (not exported), correctly typed, and `.includes()` has no indexed access concern
- **ESM:** Package uses `"type": "module"`. Constant placement is correct for ESM — no side effects, no hoisting issues
- **Alternative considered:** `as const` would narrow to tuple literals `readonly ['squad-heartbeat.yml', ...]`, making `.includes()` require literal types (not suitable here since `readdirSync()` returns `string[]`)
- **Testability:** Constant is module-scoped, not exported. For testing, prefer integration tests that verify workflow installation behavior rather than unit-testing the constant
- **Verdict:** APPROVED. Type system is correct, build is clean, no `noUncheckedIndexedAccess` violations
📌 Team update (2026-03-05T10-35-50Z): PR #201 workflow filter approved by all reviewers — framework/scaffolding distinction, implementation pattern validated, test coverage noted — decided by Keaton, Fenster, Hockney, Edie
