# Decisions

> Team decisions that all agents must respect. Managed by Scribe.

### 2026-02-21: SDK distribution stays on GitHub
**By:** Keaton (carried from beta)
**What:** Distribution is `npx github:bradygaster/squad` — never move to npmjs.com.
**Why:** GitHub-native distribution aligns with the Copilot ecosystem. No registry dependency.

### 2026-02-21: v1 docs are internal only
**By:** Keaton (carried from beta)
**What:** No published docs site for v1. Documentation is team-facing only.
**Why:** Ship the runtime first. Public docs come later when the API surface stabilizes.

### 2026-02-21: Type safety — strict mode non-negotiable
**By:** Edie (carried from beta)
**What:** `strict: true`, `noUncheckedIndexedAccess: true`, no `@ts-ignore` allowed.
**Why:** Types are contracts. If it compiles, it works. Strict mode catches entire categories of bugs.

### 2026-02-21: Hook-based governance over prompt instructions
**By:** Baer (carried from beta)
**What:** Security, PII, and file-write guards are implemented via the hooks module, NOT prompt instructions.
**Why:** Prompts can be ignored or overridden. Hooks are code — they execute deterministically.

### 2026-02-21: Node.js ≥20, ESM-only, streaming-first
**By:** Fortier (carried from beta)
**What:** Runtime target is Node.js 20+. ESM-only (no CJS shims, no dual-package hazards). Async iterators over buffers.
**Why:** Modern Node.js features enable cleaner async patterns. ESM-only eliminates CJS interop complexity.

### 2026-02-21: Casting — The Usual Suspects, permanent
**By:** Squad Coordinator (carried from beta)
**What:** Team names drawn from The Usual Suspects (1995). Scribe is always Scribe. Ralph is always Ralph. Names persist across repos and replatforms.
**Why:** Names are team identity. The team rebuilt Squad beta with these names.

### 2026-02-21: Proposal-first workflow
**By:** Keaton (carried from beta)
**What:** Meaningful changes require a proposal in `docs/proposals/` before execution.
**Why:** Proposals create alignment before code is written. Cheaper to change a doc than refactor code.

### 2026-02-21: Tone ceiling — always enforced
**By:** McManus (carried from beta)
**What:** No hype, no hand-waving, no claims without citations. Every public-facing statement must be substantiated.
**Why:** Trust is earned through accuracy, not enthusiasm.

### 2026-02-21: Zero-dependency scaffolding preserved
**By:** Rabin (carried from beta)
**What:** CLI remains thin (`cli.js`), runtime stays modular. Zero runtime dependencies for the CLI scaffolding path.
**Why:** Users should be able to run `npx` without downloading a dependency tree.

### 2026-02-21: Merge driver for append-only files
**By:** Kobayashi (carried from beta)
**What:** `.gitattributes` uses `merge=union` for `.squad/decisions.md`, `agents/*/history.md`, `log/**`, `orchestration-log/**`.
**Why:** Enables conflict-free merging of team state across branches. Both sides only append content.

### 2026-02-21T20:25:35Z: User directive — Interactive Shell as Primary UX
**By:** Brady (via Copilot)
**What:** Squad becomes its own interactive CLI shell. `squad` with no args enters a REPL where users talk directly to the team. Copilot SDK is the LLM backend — Squad shells out to it for completions, not the other way around.
**Why:** Copilot CLI has usability issues (unreliable agent handoffs, no visibility into background work). Squad needs to own the full interactive experience with real-time status and direct coordination UX.
**How:** Terminal UI with `ink` (React for CLIs), SDK session management with streaming, direct agent spawning (one session per agent). This becomes Wave 0 (foundation).
**Decisions needed:** Terminal UI library (ink vs. blessed), streaming (event-driven vs. polling), session lifecycle (per-agent vs. pool), background cleanup (explicit vs. timeout).

### 2026-02-21T21:22:47Z: User directive — rename `squad watch` to `squad triage`
**By:** Brady (via Copilot)
**What:** "squad watch" should be renamed to "squad triage" — user feedback that the command name should reflect active categorization/routing, not passive observation.
**Why:** User request — captured for team memory.

### 2026-02-21T21:35:22Z: User directive — CLI command naming: `squad loop`
**By:** Brady (via Copilot)
**What:** The work monitor CLI command should be `squad loop`, not `squad ralph` or `squad monitor`. "Loop" is universally understood — no Squad lore needed. Finalized preference (supersedes Keaton's recommendations in favor of `squad monitor`). Update issue #269 accordingly.
**Why:** User request — final naming decision. Brady prefers `squad loop` for clarity and universal understanding.

### 2026-02-21T21:35:22Z: User directive — `squad hire` CLI command
**By:** Brady (via Copilot)
**What:** Add a `squad hire` CLI command. This is the team creation entry point — the init experience with personality. "squad hire" instead of "squad init".
**Why:** User request — Brady wants CLI commands that feel natural and match Squad's identity.

### 2026-02-21: CLI rename — `watch` → `triage` (recommended) (consolidated)
**By:** Keaton (Lead)
**What:** Rename `squad watch` to `squad triage`. Keep `watch` as silent alias for backward compatibility. Explicitly recommend against `squad ralph` as a CLI command. Suggest `squad monitor` or `squad loop` instead to describe the persistent monitoring function.
**Why:** "Triage" is 40% more semantically accurate (matches GitHub's own terminology and incident-management patterns). "Ralph" is internal lore — opaque to new users and violates CLI UX conventions (all user-facing commands are action verbs or domain nouns). `squad monitor` is self-describing and professional.
**Details:** Change is low-risk. Silent alias prevents breakage. Confidence 85% for triage rename, 90% confidence Ralph shouldn't be user-facing.
**Reference:** Keaton analysis in `.squad/decisions/inbox/keaton-cli-rename.md`

### 2026-02-21: SDK M0 blocker — upgrade from `file:` to npm reference (resolved)
**By:** Kujan (SDK Expert), Edie (implementation)
**What:** Change `optionalDependencies` from `file:../copilot-sdk/nodejs` to `"@github/copilot-sdk": "^0.1.25"`. The SDK is published on npm (28 versions, SLSA attestations). This one-line change unblocks npm publish and removes CI dependency on sibling directory.
**Why:** The `file:` reference is the only M0 blocker. Squad's SDK surface is minimal (1 runtime import: `CopilotClient`). Keep SDK in `optionalDependencies` to preserve zero-dependency scaffolding guarantee (Rabin decision).
**Verified:** Build passes (0 errors), all 1592 tests pass with npm reference. No tests require live Copilot CLI server. PR #271 merged successfully.
**Reference:** Kujan audit + Edie implementation in `.squad/decisions/inbox/edie-sdk-swap.md`
**Closes:** #190, #193, #194

### 2026-02-21T21:35:22Z: User directive — no temp/memory files in repo root
**By:** Brady (via Copilot)
**What:** NEVER write temp files, issue files, or memory files to the repo root. All squad state/scratch files belong in .squad/ and ONLY .squad/. Root tree of a user's repo is sacred — don't clutter it.
**Why:** User request — hard rule. Captured for all agents.

### 2026-02-21: npm workspace protocol for monorepo
**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-21
**PR:** #274
**What:** Use npm-native workspace resolution (version-string references like `"0.6.0-alpha.0"`) instead of `workspace:*` protocol for cross-package dependencies.
**Why:** The `workspace:*` protocol is pnpm/Yarn-specific. npm workspaces resolve workspace packages automatically by matching the package name in the `workspaces` glob — a version-string reference is all that's needed. Using npm-native semantics avoids toolchain lock-in and keeps the monorepo compatible with stock npm.
**Impact:** All future inter-package dependencies in `packages/*/package.json` should use the actual version string, not `workspace:*`.

### 2026-02-21: Resolution module placement and API separation
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #210, #211
**What:**
- `resolveSquad()` and `resolveGlobalSquadPath()` live in `src/resolution.ts` at the repo root, not in `packages/squad-sdk/`.
- The two functions are independent — `resolveSquad()` does NOT automatically fall back to `resolveGlobalSquadPath()`.
**Why:**
1. **Placement:** Code hasn't migrated to the monorepo packages yet. Putting it in `packages/squad-sdk/src/` would create a split that doesn't match the current build pipeline (`tsc` compiles `src/` to `dist/`). When the monorepo migration happens, `src/resolution.ts` moves with everything else.
2. **Separation of concerns:** Issue #210 says "repo squad always wins over personal squad" — that's a *policy* decision for the consumer, not for the resolution primitives. Keeping the two functions independent lets CLI/runtime compose them however needed (e.g., try repo first, fall back to global, or merge both).
**Impact:** Low. When packages split happens, move `src/resolution.ts` into `packages/squad-sdk/src/`. The public API shape stays the same.

### 2026-02-21: Changesets setup — independent versioning for squad-sdk and squad-cli
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #208
**What:** Installed and configured @changesets/cli v2 for independent package versioning across the monorepo.
**Configuration:**
- `access`: `"public"` (both packages will be published)
- `baseBranch`: `"main"` (release branch for changesets)
- `fixed`: `[]` (empty — no linked releases)
- `linked`: `[]` (empty — no linked releases)
- `updateInternalDependencies`: `"patch"` (default, appropriate for SDK→CLI dependency)
**Why:** Squad is a monorepo with two distinct packages (squad-sdk and squad-cli) with different release cadences and audiences. Independent versioning prevents unnecessary releases and version inflation when only one package changes.
**Implementation:** `.changeset/config.json` created, npm script `changeset:check` added to `package.json` for CI validation.
**Next Steps:** Contributors use `npx changeset add` before merge; release workflow runs `changeset publish` to GitHub.

### 2026-02-21: --global flag and status command pattern
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #212, #213
**What:**
- `--global` flag on `init` and `upgrade` routes to `resolveGlobalSquadPath()` instead of `process.cwd()`.
- `squad status` composes both `resolveSquad()` and `resolveGlobalSquadPath()` to show which squad is active and why.
- All routing logic stays in `src/index.ts` main() — init.ts and upgrade.ts are path-agnostic (they take a `dest` string).
**Why:**
1. **Thin CLI contract:** init and upgrade already accept a destination directory. The `--global` flag is a CLI concern, not a runtime concern — so it lives in the CLI routing layer only.
2. **Composition over fallback:** `squad status` demonstrates the intended consumer pattern from #210/#211: try repo resolution first, then check global path. The resolution primitives stay independent.
3. **Debugging UX:** Status shows repo resolution, global path, and global squad existence — all the info needed to debug "why isn't my squad loading?" issues.
**Impact:** Low. Single-file change to `src/index.ts`. No changes to resolution algorithms or init/upgrade internals.

### 2026-02-21: No repo root clutter — ensureSquadPath() guard
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #273

**What:**
- Added `ensureSquadPath(filePath, squadRoot)` in `src/resolution.ts` — a guard that validates a target path is inside `.squad/` or the system temp directory before any write occurs. Throws with a descriptive error if the path is outside both.
- Exported from the public API (`src/index.ts`).

**Why:**
Brady's hard rule: ALL squad scratch/temp/state files MUST go in `.squad/` only. During issue creation, 20+ temp files were written directly to the repo root. This guard provides a single validation function that any file-writing code path can call to enforce the policy deterministically (per the hooks-over-prompts decision).

**Audit findings:**
- 30+ file write calls across `src/` — most already write into `.squad/` subdirectories or user-requested destinations.
- The `tools/index.ts` write_file tool and `cli/commands/export.ts` write to user-specified paths (intentional, user-requested).
- No existing code paths were changed — this is a new guard utility for future enforcement.

**Impact:** Low. Additive-only change. Existing behavior unchanged. Future code that writes temp/scratch files should call `ensureSquadPath()` before writing.

### 2026-02-21: CLI routing logic is testable via composition, not process spawning
**By:** Hockney (Tester)
**Date:** 2026-02-21
**Re:** #214

**What:** Integration tests for `squad status` and `--global` flag test the *routing logic* (the conditional expressions from `main()`) directly, rather than spawning a child process and parsing stdout.

**Why:**
1. `main()` in `src/index.ts` calls `process.exit()` and is not exported — spawning would be flaky and slow.
2. The routing logic is simple conditionals over `resolveSquad()` and `resolveGlobalSquadPath()` — testing those compositions directly is deterministic and fast.
3. If `main()` is ever refactored to export a testable function, these tests can be upgraded — the assertions stay the same.

**Impact:** Low. Sets a pattern for future CLI integration tests: test the logic, not the process.

### 2026-02-21: Ink + React dependency versions
**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-21
**Re:** #233
**PR:** #281

**What:**
- **ink@6.8.0** — latest stable, ESM-native, no CJS shims required
- **react@19.2.4** — required by ink 6.x (peer dependency); React 19 is ESM-friendly
- **ink-testing-library@4.0.0** — matches ink 6.x major version pairing
- **@types/react@19.2.14** — TypeScript types for React 19

**Why:** ink 6.x + React 19 are fully ESM-native — aligns with our ESM-only policy. ink-testing-library enables unit-testing ink components without a real terminal. All added as root-level deps for now; can be scoped to `packages/squad-cli` during monorepo migration.

**Impact:** Low. No source changes — dependency additions only. Build passes (tsc strict), all 1621 tests pass.

### 2026-02-21: GitHub-native distribution deprecated in favor of npm
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #219

**What:**
- Root `cli.js` now prints a deprecation warning to stderr when invoked via `npx github:bradygaster/squad`.
- Users are directed to `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli`.
- The warning is non-blocking — existing behavior continues after the notice.

**Why:** The `@bradygaster/squad-cli` and `@bradygaster/squad-sdk` packages are now published to npm. The GitHub-native distribution (`npx github:bradygaster/squad`) was the original entry point but is now superseded. This deprecation notice gives users a migration path before the GitHub-native entry point is eventually removed.

**Supersedes:** The earlier "SDK distribution stays on GitHub" decision (Keaton, carried from beta). npm is now the primary distribution channel.

**Impact:** Low. Additive-only change to the bundled `cli.js`. No behavior change — just a stderr warning.

### 2026-02-21: Shell chrome patterns and session registry design
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #236, #237

**Shell Chrome:** The interactive shell header uses box-drawing characters (`╭╰│─`) for visual chrome. Version is read from `package.json` at runtime via `createRequire(import.meta.url)` — no hardcoded version strings. Box-drawing chrome is universally supported in modern terminals and provides clear visual framing without external dependencies. Using `createRequire` for JSON import follows the existing pattern in `src/build/github-dist.ts` and avoids ESM JSON import assertions.

**Exit handling:** Three exit paths — `exit` command, `/quit` command, and Ctrl+C (SIGINT). All produce the same cleanup message ("👋 Squad out.") for consistency.

**Session Registry:** `SessionRegistry` is a simple Map-backed class with no persistence, no event emitting, and no external dependencies. It tracks agent sessions by name with status lifecycle: `idle` → `working` → `streaming` → `idle`/`error`. Designed as a pure state container that the ink UI will consume. The Map-based approach allows O(1) lookup by agent name, which is the primary access pattern for status display.

**Impact:** Low. Two files changed. No API surface changes outside the shell module. SessionRegistry is exported for future consumption but has no current consumers.

### 2026-02-21: TSX compilation enabled in root tsconfig
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #242, #243, #244

**What:** Added `"jsx": "react-jsx"` to the root `tsconfig.json` to enable TSX compilation for ink-based React components in `src/cli/shell/components/`.

**Why:** The shell UI uses ink (React for CLIs), which requires JSX support. `react-jsx` is the modern transform — no need to import React in every file for JSX (though we do for explicitness). This is a project-wide setting because all TSX files live under `src/` which is the root `rootDir`.

**Components created:**
- `AgentPanel.tsx` — agent status display (consumes `AgentSession` from `types.ts`)
- `MessageStream.tsx` — streaming message output (consumes `ShellMessage` from `types.ts`)
- `InputPrompt.tsx` — readline input with history navigation
- `components/index.ts` — barrel export

All components are pure presentational — no SDK calls, no side effects. State management is the responsibility of the shell orchestrator.

**Impact:** Low. Only affects `.tsx` files. No existing `.ts` files are impacted. The setting is compatible with strict mode and NodeNext module resolution.

### 2026-02-21: Shell module structure and entry point routing
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #234, #235
**PR:** #282

**What:**
- `src/cli/shell/` module created with `index.ts`, `types.ts`, and `components/` placeholder directory.
- `squad` with no args now launches `runShell()` (interactive shell) instead of `runInit()`.
- `squad init` remains available as an explicit subcommand — no functionality removed.

**Why:**
1. **Entry point change:** Brady's directive makes the interactive shell the primary UX. Running `squad` with no args should enter the shell, not re-run init. Init is still available via `squad init`.
2. **Placeholder over premature implementation:** `runShell()` is console.log-only. Ink dependency is handled separately (#233). This keeps the shell module structure ready without coupling to the UI library.
3. **Types first:** `ShellState`, `ShellMessage`, and `AgentSession` interfaces define the shell's data model before any UI code exists. This lets other agents (ink wiring, agent spawning) code against stable types.

**Impact:** Low. No existing tests broken (1621/1621 pass). The only behavior change is `squad` (no args) prints a shell header and exits instead of running init. `squad init` and `squad --help` / `squad help` continue to work as before.

### 2026-02-21: Agent spawn infrastructure pattern
**By:** Fenster (Core Dev)
**Date:** 2026-02-21
**Re:** #238

**What:** Created `src/cli/shell/spawn.ts` with three exported functions:
- `loadAgentCharter(name, teamRoot?)` — filesystem charter loading via `resolveSquad()`
- `buildAgentPrompt(charter, options?)` — system prompt construction from charter + context
- `spawnAgent(name, task, registry, options?)` — full spawn lifecycle with SessionRegistry integration

SDK session creation (CopilotClient) is intentionally stubbed. The spawn infrastructure is complete; session wiring comes when we understand the SDK's session management API.

**Why:**
1. **Separation of concerns:** Charter loading, prompt building, and session lifecycle are independent functions. This lets stream bridge and coordinator reuse `buildAgentPrompt` and `spawnAgent` without coupling.
2. **Testability:** `teamRoot` parameter on `loadAgentCharter` allows tests to point at a fixture directory without mocking `resolveSquad()`.
3. **Stub-first:** Rather than guessing the CopilotClient session API shape, we built the surrounding infrastructure. The TODO is a single integration point — when the SDK surface is clear, the change is surgical.

**Impact:** Low. Additive-only. No existing behavior changed. Two files modified: `spawn.ts` (new), `index.ts` (barrel exports added).

### 2026-02-21: Session lifecycle owns team discovery
**By:** Fortier (Node.js Runtime)
**Date:** 2026-02-21
**Re:** #240

**What:** `ShellLifecycle.initialize()` is the single entry point for team discovery in the interactive shell. It reads `.squad/team.md`, parses the Members table, and registers active agents in `SessionRegistry`. No other shell component should independently parse `team.md` or discover agents.

**Why:**
1. **Single responsibility:** Team discovery is a lifecycle concern — it happens once at shell startup. Scattering `team.md` parsing across components would create divergent interpretations of the manifest format.
2. **Testability:** By owning initialization, `ShellLifecycle` can be tested with a mock filesystem (or temp `.squad/` directory) without touching the registry or renderer.
3. **State consistency:** The lifecycle class is the source of truth for shell state. If initialization fails (missing `.squad/`, missing `team.md`), the state transitions to `error` and downstream components can check `getState().status` rather than catching exceptions everywhere.

**Impact:** Low. Additive-only. Future shell features (command routing, agent spawning) should call `lifecycle.getDiscoveredAgents()` instead of re-parsing `team.md`.

### 2026-02-21: StreamBridge is an event sink, not a subscriber
**By:** Fortier (Node.js Runtime)
**Date:** 2026-02-21
**Re:** #239

**What:** `StreamBridge` receives `StreamingEvent` objects via `handleEvent()` but does not register itself with `StreamingPipeline`. The wiring (`pipeline.onDelta(e => bridge.handleEvent(e))`) is the caller's responsibility.

**Why:**
1. **Testability:** The bridge can be tested with plain event objects — no pipeline instance needed.
2. **Flexibility:** The shell entry point controls which events reach the bridge (e.g., filtering by session, throttling for UI frame rate).
3. **Single responsibility:** The bridge translates events to callbacks; it doesn't manage subscriptions or lifecycle.

**Impact:** Low. Pattern applies to all future bridges between the pipeline and UI layers (ink components, web sockets, etc.).

### 2026-02-21: Shell module test patterns — fixtures over mocks
**By:** Hockney (Tester)
**Date:** 2026-02-21
**Re:** #248

**What:** Shell module tests use `test-fixtures/.squad/` with real files (team.md, routing.md, agent charters) instead of mocking fs calls. The `loadAgentCharter` and `buildCoordinatorPrompt` functions accept a `teamRoot` parameter that enables this pattern.

**Why:**
1. Real file reads catch encoding issues, path resolution bugs, and parsing edge cases that mocks hide.
2. The `teamRoot` parameter was already designed into the API — tests should use it.
3. StreamBridge tests use callback spies (arrays capturing calls) rather than vi.fn() — simpler to assert on and read.

**Impact:** Low. Establishes fixture patterns for future shell module tests. test-fixtures/.squad/ is now a shared test resource.

### 2026-02-21: Branch protection configuration
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #209

**Main Branch Protection:** Require PR + passing build status checks. All changes to main require a PR (not direct push). PR cannot be merged until `build` check passes (CI/CD gate). Zero approving reviews required — allows team to use PR merge buttons freely (no blocking review workflow needed). Admins not exempted (same rules apply to everyone, strengthens process integrity).

**Insider Branch:** No protection — allows direct pushes. Insider releases are automation-driven; direct branch push is the automation's path.

**Implementation:** Used GitHub API (REST v3): `PUT /repos/{owner}/{repo}/branches/main/protection` with required_status_checks + required_pull_request_reviews. `DELETE /repos/{owner}/{repo}/branches/insider/protection` confirmed no-op (no existing rule).

**Note:** Status check context name is `"build"` — must match the exact check name from CI workflow. If CI workflow renames the check, branch protection must be updated to match.

### 2026-02-21: Insider publish package scaffolds
**By:** Kobayashi (Git & Release)
**Date:** 2026-02-21
**Re:** #215
**PR:** #283

**What:** Added minimal publishable entry points to `packages/squad-sdk/` and `packages/squad-cli/` so the insider publish workflow can produce valid npm packages.

**squad-sdk:**
- `src/index.ts`: exports `VERSION` constant (placeholder — full source migration comes later)
- `tsconfig.json`: extends root, outputs to `dist/` with declarations
- `package.json`: added `files`, `scripts.build`

**squad-cli:**
- `src/cli.ts`: placeholder binary (`#!/usr/bin/env node`)
- `tsconfig.json`: extends root, outputs to `dist/` with declarations
- `package.json`: added `files`, `scripts.build`; `bin` already pointed to `./dist/cli.js`

**Root:** `build` script updated: `tsc && npm run build --workspaces --if-present`

**Why:** The insider publish pipeline triggers on push to `insider` branch but both workspace packages were empty scaffolds — no source, no build output, nothing to publish. This adds the minimum viable content so `npm publish` succeeds and the insider channel can be verified end-to-end.

**Constraints respected:** ESM-only, TypeScript strict mode, Node.js >=20, squad-cli depends on squad-sdk via version string, `files` lists ensure only `dist/` and `README.md` ship in the published package.

**Impact:** Low. Does not migrate real source code — these are placeholders. Does not add tests for workspace packages (nothing to test yet).

### 2026-02-21: Distribution moves to npm for production
**By:** Rabin (Distribution)
**Date:** 2026-02-21
**Re:** #216

**What:** Squad packages (`@bradygaster/squad-sdk` and `@bradygaster/squad-cli`) are now distributed via npmjs.com. This supersedes the beta-era decision "Distribution is `npx github:bradygaster/squad` — never move to npmjs.com."

**Why:** The project has matured from beta to production. npm is the standard distribution channel for Node.js packages. The insider publish (`0.6.0-alpha.0`) validated the pipeline. Production publish (`0.6.0`) is the natural next step.

**Workflow:** Tag push `v*` on `main` triggers `.github/workflows/squad-publish.yml`. Auth is CI-only via `setup-node` + `NODE_AUTH_TOKEN`. No root `.npmrc` needed. No `--provenance` (private repo limitation).

**Impact:** Users install via `npm install @bradygaster/squad-cli` (or `npx @bradygaster/squad-cli`). The GitHub-native `npx github:bradygaster/squad` path may still work but is no longer the primary distribution channel.

### 2026-02-21: Coordinator prompt structure — three routing modes
**By:** Verbal (Prompt Engineer)
**Date:** 2026-02-21
**Re:** #241

**What:** The coordinator system prompt (`buildCoordinatorPrompt()`) uses a structured response format with three routing modes:
- `DIRECT:` — coordinator answers inline, no agent spawn
- `ROUTE:` + `TASK:` + `CONTEXT:` — single agent delegation
- `MULTI:` with bullet list — fan-out to multiple agents

The parser (`parseCoordinatorResponse()`) extracts a `RoutingDecision` from the LLM response. Unrecognized formats fall back to `DIRECT` (safe default — never silently drops input).

**Why:**
1. **Structured output over free-form:** Keyword prefixes (`ROUTE:`, `DIRECT:`, `MULTI:`) are cheap to parse and reliable across model temperatures. No JSON parsing needed.
2. **Fallback-to-direct:** If the LLM doesn't follow the format, the response is surfaced to the user rather than lost. This prevents silent failures in the routing layer.
3. **Prompt composition from files:** team.md and routing.md are read at prompt-build time, not baked in. This means the coordinator adapts to team changes without code changes.

**Impact:** Low. Additive module. No changes to existing shell behavior. Future work will wire this into the readline loop and SDK session.
### 2026-02-21: CRLF normalization — single utility, applied at parser entry points
**By:** Fenster (Core Dev)
**Re:** #220, #221 (Epic #181)

**What:**
- Created `src/utils/normalize-eol.ts` exporting `normalizeEol(content: string): string` — replaces `\r\n` and `\r` with `\n`.
- Applied as the first line of 8 parser functions across 6 files: markdown-migration.ts (3 parsers), routing.ts, charter-compiler.ts, skill-loader.ts, agent-doc.ts, doc-sync.ts.

**Why:**
On Windows with `core.autocrlf=true`, file reads return `\r\n` line endings. Every parser that calls `.split('\n')` would leave stray `\r` characters in parsed values — breaking regex matches, table parsing, and string comparisons. Normalizing at the parser entry point is the minimal defensive guard: one line per function, no behavioral change on LF-only systems.

**Pattern:**
Always normalize at the *entry* of the parsing function, not at the file-read callsite. This ensures parsers are self-contained and safe regardless of how content arrives (file read, API response, test fixture).

**Impact:**
Low. Additive-only. No test changes needed. Existing tests pass because test strings are already LF-only. The guard is transparent for LF inputs.

### 2026-02-21: CLI entry point split — src/index.ts is a pure barrel
**By:** Edie (TypeScript Engineer)
**Re:** #187

**What:**
- `src/index.ts` is now a pure re-export barrel with ZERO side effects. No `main()`, no `process.exit()`, no argument parsing.
- `src/cli-entry.ts` contains the full `main()` function and all CLI routing logic.
- `VERSION` is exported from `index.ts` (public API constant); `cli-entry.ts` imports it.
- `SquadError` is now explicitly exported from the barrel.

**Why:**
Anyone importing `@bradygaster/squad` as a library (e.g., SquadUI) was triggering CLI argument parsing and `process.exit()` on import. This poisoned the library entry point. The split makes `dist/index.js` safe for library consumption while `dist/cli-entry.js` remains the CLI binary.

**Impact:**
Low. Two files changed. Build passes (tsc strict), all 1683 tests pass. No changes to package.json `bin` or `main`.

**Future:**
When source migrates to `packages/squad-cli/`, the CLI entry point moves with it. The barrel (`packages/squad-sdk/src/index.ts`) stays side-effect-free.

### 2026-02-21: Process.exit() refactor — library-safe CLI functions
**By:** Kujan (SDK Expert)
**Re:** #189

**What:**
- `fatal()` now throws `SquadError` instead of calling `process.exit(1)`.
- `src/index.ts` is a pure barrel export with zero side effects (no `main()`, no `process.exit()`).
- `src/cli-entry.ts` is the sole CLI entry point — it catches `SquadError` and calls `process.exit(1)`.
- `runWatch()` resolves its Promise on SIGINT/SIGTERM instead of `process.exit(0)`.
- `runShell()` closes readline on SIGINT instead of `process.exit(0)`.
- `SquadError` class is exported from the public API.

**Why:**
SquadUI (VS Code extension) imports CLI functions as a library. `process.exit()` kills the entire VS Code extension host. All library-consumable functions must throw errors or return results, never call `process.exit()`. Only the CLI entry point (the thin presentation layer) may call `process.exit()`.

**Pattern established:**
- Library functions: throw `SquadError` or return result objects
- CLI entry point: catches errors, formats output, calls `process.exit()`
- Library consumers: catch `SquadError` for structured error handling

**Impact:**
Medium. Changes error handling contract for all functions that used `fatal()`. Backwards-compatible for CLI users (same behavior). Library consumers now get catchable errors instead of process termination.

### 2026-02-21: User directive — docs as you go
**By:** bradygaster (via Copilot)
**What:** Doc and blog as you go during SquadUI integration work. Doesn't have to be perfect — a proper docs pass comes later — but keep docs updated incrementally.
**Why:** User request — captured for team memory

### 2026-02-22T035939Z: Repository scope directive
**By:** Brady (via Copilot)
**What:** Do NOT change anything in bradygaster/squad repo. This working copy is bradygaster/squad-pr — changes are permitted here. The two repos are distinct.
**Why:** User request — captured for team memory

### 2026-02-22: SDK/CLI File Split Plan — Definitive Mapping
**By:** Keaton (Lead)
**Status:** Decision
**Scope:** Monorepo restructure — move `src/` into `packages/squad-sdk/` and `packages/squad-cli/`

**Overview:** All 114 `.ts` files in root `src/` must be split between two workspace packages. The dependency direction is **one-way: CLI → SDK**. No SDK module imports from CLI. This is clean and the split is mechanical.

**SDK Package (`packages/squad-sdk/src/`):**
- **Directories:** adapter, agents, build, casting, client, config, coordinator, hooks, marketplace, ralph, runtime, sharing, skills, tools, utils (15 total)
- **Standalone files:** index.ts, resolution.ts, parsers.ts, types.ts
- **Exports:** Expanded to 18 subpath exports matching directory structure
- **Dependencies:** `@github/copilot-sdk` only (zero UI deps)

**CLI Package (`packages/squad-cli/src/`):**
- **Directories:** cli/ (all CLI submodules: core/, commands/, shell/, components/)
- **Standalone files:** cli-entry.ts (becomes `bin.squad` target)
- **Dependencies:** `@bradygaster/squad-sdk`, ink, react, esbuild

**Root Package:**
- **Role:** Workspace orchestrator only (not publishable)
- **Preserved:** `package.json` (workspace def), tsconfig.json (base config), vitest.config.ts, test/, test-fixtures/, templates/, docs/, .squad/
- **Removed:** main, types, bin, runtime dependencies

**Key Call — SDK Barrel Cleanup:** Remove CLI utilities (`success`, `error`, `warn`, `fatal`, etc.) from SDK exports. CLI re-exports in `src/index.ts` were a mistake — those are CLI implementation details, not SDK API. This is a breaking change that's correct and intentional.

**Import Rewriting Rules:**
- CLI → SDK relative imports become package imports (`from '../config/'` → `from '@bradygaster/squad-sdk/config'`)
- Intra-SDK and intra-CLI imports stay relative (unchanged)
- No circular dependencies verified (clean DAG)

**Migration Order:**
1. **Phase 1 (SDK first):** Copy 15 dirs + 4 files, update exports, build in isolation
2. **Phase 2 (CLI second):** Copy cli/ + cli-entry.ts, rewrite imports to SDK packages, build against SDK
3. **Phase 3 (root cleanup):** Delete root src/, update test imports, finalize structure

**Templates:** Copy into CLI package (Option A — self-contained packages).

**Why:** One-way dependency graphs enable independent package evolution. SDK stays pure library; CLI stays thin consumer. Future features only touch the relevant package.

### 2026-02-22: Version Alignment — 0.7.0 stubs → 0.8.0 real packages
**By:** Kobayashi (Git & Release)
**Status:** APPROVED & EXECUTED

**Context:**
- **0.7.0 npm stubs:** Placeholder packages published on npmjs.com (no real code)
- **Goal:** Publish real, working code under new version

**Decision: Bump to 0.8.0**
- **Rationale:** Clear break from stubs (0.7.0 is placeholder; 0.8.0 is functional code). Pre-1.0 signal appropriate for alpha software.

**Changes Executed:**
1. SDK `package.json`: version `0.7.0` → `0.8.0`
2. CLI `package.json`: version `0.7.0` → `0.8.0`, SDK dependency locked to `@bradygaster/squad-sdk@0.8.0`
3. SDK `src/index.ts`: `VERSION` export `0.7.0` → `0.8.0`
4. Root `package.json`: added `"private": true` (prevent accidental npm publish of workspace coordinator)

**Verification:** ✅ All version strings aligned, CLI dependency on SDK pinned, root marked private.

### 2026-02-22: Defer test import migration until root src/ removal
**By:** Hockney (Tester)
**Status:** Proposed

**Context:** After SDK/CLI workspace split, all 56 test files still import from root `../src/`. Build and all 1719 tests pass cleanly because root `src/` still exists.

**Decision:** Defer migrating test imports from `../src/` to `@bradygaster/squad-sdk` / `@bradygaster/squad-cli` until root `src/` is actually removed.

**Rationale:**
1. **Exports map gap:** SDK exposes 18 subpath exports; tests import ~40+ distinct deep internal paths not in exports map
2. **CLI no exports:** cli/shell/ tests have no package-level export path to migrate to
3. **Barrel divergence:** Root `src/index.ts` still exports CLI functions SDK package correctly does not
4. **Risk/reward:** 150+ import lines for zero functional benefit while root `src/` exists is pure risk

**When to revisit:** When root `src/` is deleted (blocker at that point). Options: expand exports maps, add vitest resolve.alias, or move tests into workspace packages.

### 2026-02-22: Build System Migration — tsconfig + package.json
**By:** Edie (TypeScript Engineer)
**Status:** Decision
**Scope:** Monorepo build configuration for SDK/CLI workspace packages

**What Changed:**
1. **Root tsconfig.json:** Base config only, shared compiler options, `files: []` (compiles nothing), project references to both packages
2. **SDK tsconfig.json:** Extends root, `composite: true`, declarations + maps, no JSX
3. **CLI tsconfig.json:** Extends root, `composite: true`, `jsx: "react-jsx"`, references SDK package
4. **Root package.json:** `private: true`, workspace orchestrator, stripped main/types/bin/runtime deps
5. **SDK package.json:** 18 subpath exports, `@github/copilot-sdk` as direct dependency
6. **CLI package.json:** `bin.squad` → `./dist/cli-entry.js`, ink/react runtime deps, templates in files array

**Why `composite: true`:** TypeScript project references require this. Without it, cross-package type information fails to resolve.

**Build Order:** `npm run build --workspaces` builds SDK first (no deps), then CLI (depends on SDK). npm respects topological order automatically.

**Verified:** Both packages compile with zero errors. All dist artifacts (`.js`, `.d.ts`, `.d.ts.map`) emitted correctly.

### 2026-02-22: Subpath exports in @bradygaster/squad-sdk
**By:** Edie (TypeScript Engineer)
**Issue:** #227

**What:** `packages/squad-sdk/package.json` declares 18 subpath exports (`.`, `./parsers`, `./types`, and 15 module paths). Each uses types-first condition ordering.

**Why:** Enables tree-shaking and focused imports. Consumers can `import { … } from '@bradygaster/squad-sdk/config'` instead of pulling the entire barrel. Type-only consumers can import from `./types` with zero runtime cost.

**Constraints:**
- Every subpath must have a corresponding source barrel (`src/<path>.ts` or `src/<path>/index.ts`)
- `"types"` condition must appear before `"import"` — Node.js evaluates top-to-bottom
- ESM-only: no `"require"` condition per team decision
- Adding a new subpath requires both source barrel and exports entry; removing one without the other breaks resolution

### 2026-02-22: Barrel file conventions for parsers and types
**By:** Kujan (SDK Expert)
**Issues:** #225, #226 (Epic #181)

**What:**
- `src/parsers.ts` re-exports all parser functions AND their types using `export { ... } from` and `export type { ... } from`
- `src/types.ts` re-exports ONLY types using `export type { ... } from` exclusively — guaranteed zero runtime imports
- Both follow the existing ESM barrel pattern from `src/index.ts`

**Why:**
1. **Consumer convenience:** SquadUI and others can import parsers or types from a single module instead of reaching into internal paths
2. **Separation of concerns:** `types.ts` is safe for type-only contexts (declaration files). `parsers.ts` includes runtime functions for consumers that need them
3. **No existing modifications:** Both are additive-only new files — zero risk to existing behavior

**Impact:** Low. Two new files, no changes to existing source. Build passes, all 1683 tests pass.



