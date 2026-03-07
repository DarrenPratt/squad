# Changelog

All notable changes to this project will be documented in this file.

## [0.8.22] - 2026-03-11

### Added — SDK-First Mode (Phase 1)
- **Builder functions** — Type-safe team configuration with runtime validation
  - `defineTeam()` — Team metadata, project context, member roster
  - `defineAgent()` — Agent definition with role, model, tools, capabilities
  - `defineRouting()` — Routing rules with pattern matching and priority
  - `defineCeremony()` — Ceremony scheduling (standups, retros, etc.)
  - `defineHooks()` — Governance hooks (write paths, blocked commands, PII scrubbing)
  - `defineCasting()` — Casting configuration (universe allowlists, overflow strategy)
  - `defineTelemetry()` — OpenTelemetry configuration
  - `defineSquad()` — Top-level composition builder
- **`squad build` command** — Compile TypeScript definitions to `.squad/` markdown
  - Generates `.squad/team.md`, `.squad/routing.md`, agent charters, ceremonies
  - Supports `--check` (validation), `--dry-run` (preview), `--watch` (file monitoring stub)
  - Protected files (decisions.md, history.md) never overwritten
- **SDK Mode Detection** — Coordinator prompt includes SDK-First mode awareness
- **Documentation**
  - New guide: [SDK-First Mode](docs/sdk-first-mode.md) — concepts, builder reference, examples
  - Updated [SDK Reference](docs/reference/sdk.md) — builder function signatures and types
  - README quick reference for SDK-First teams

### Added — Remote Squad Mode (ported from @spboyer's [bradygaster/squad#131](https://github.com/bradygaster/squad/pull/131))
- `resolveSquadPaths()` dual-root resolver — project-local vs team identity directories
- `squad doctor` command — 9-check setup validation with emoji output
- `squad link <path>` command — link a project to a remote team root
- `squad init --mode remote` — initialize with remote team root config
- `ensureSquadPathDual()` / `ensureSquadPathResolved()` — dual-root write guards

### Fixed — Critical Crash & Stability Issues
- **Installation crash fix (#247)** — `npx @bradygaster/squad-cli` was failing on fresh installs due to hard dependency on `@opentelemetry/api` that couldn't resolve in isolated npm environments. Created `otel-api.ts` resilient wrapper with full no-op fallbacks. Moved OTel to optional dependencies. Telemetry now gracefully degrades when absent.
- **CLI command wiring (#244)** — Commands `rc`, `copilot-bridge`, `init-remote`, `rc-tunnel` were implemented but never wired into CLI entry point. Now properly connected and discoverable.
- **Model config round-trip (#245)** — `AgentDefinition.model` now accepts `string | ModelPreference` for structured model configuration. Charter compiler updated to emit and parse the new format correctly.
- **ExperimentalWarning suppression** — Node's `ExperimentalWarning` for `node:sqlite` no longer leaks into terminal output. Suppressed via process.emit override in cli-entry.ts.
- **Blankspace fix (#239)** — Idle blank space below agent panel removed. Conditional height constraint only active during processing.
- **Windows race condition (EBUSY)** — `fs.rm` with retry logic and exponential backoff. Tests now pass reliably on Windows.
- **Test hardening** — Speed gate threshold adjustments for growing CLI codebase. 25 regression tests fixed (PR #221).
- **CI stabilization** — GitHub Actions pipeline fixed and green (PRs #232, #228).

### Changed — Distribution & Versioning
- **Distribution:** npm-only distribution channel. No more GitHub-native distribution (`npx github:bradygaster/squad`). Users now install via `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli` from npm registry.
- **Semantic Versioning fix (#692):** Version format changed from `X.Y.Z.N-preview` to `X.Y.Z-preview.N` to comply with semantic versioning spec (prerelease identifier after patch, build metadata after prerelease). Example: `0.8.6-preview.1` instead of `0.8.6.1-preview`.
- **Version transition:** Public repo final version was `0.8.5.1`. Private repo continues at `0.8.x` cadence (next publish after 0.8.17 is 0.8.18), following semver prerelease convention for development.

### Community
- Thanks to **Shayne Boyer** ([@spboyer](https://github.com/spboyer)) for the original remote mode design.
- PR #199 (migration command) received, reviewed, and feedback captured as issue #231 for future implementation.
- PR #243 (blankspace fix) — community contribution cherry-picked and credited.

### By the Numbers
- 26 issues closed
- 16 PRs merged
- 3,724 tests passing (3,740 total, 13 known Windows timeout flakes, 0 logic failures)
- 8 builder functions shipped
- 4 CLI commands wired
- 1 critical crash fix (OTel dependency)
- 25 regression tests fixed

## [Unreleased]

## [0.8.20] - 2025-01-08

### Fixed
- **Template path fix (#190):** Corrected all references from `.squad-templates/` to `.squad/templates/` to align with the project's directory structure. This ensures the CLI correctly resolves team member charters and other template resources.
- **Init test templates:** Updated initialization tests to reference the corrected `.squad/templates/` directory path.

## [0.8.18-preview] - TBD

### Added — Remote Squad Mode (ported from @spboyer's [bradygaster/squad#131](https://github.com/bradygaster/squad/pull/131))
- `resolveSquadPaths()` dual-root resolver — project-local vs team identity directories (#311)
- `squad doctor` command — 9-check setup validation with emoji output (#312)
- `squad link <path>` command — link a project to a remote team root (#313)
- `squad init --mode remote` — initialize with remote team root config (#313)
- `ensureSquadPathDual()` / `ensureSquadPathResolved()` — dual-root write guards (#314)

### Changed — npm Distribution & Monorepo Structure
- **Distribution:** Migrated from GitHub-native (`npx github:bradygaster/squad`) to npm packages (`npm install -g @bradygaster/squad-cli` / `npx @bradygaster/squad-cli`)
- **Packages:** Independent versioning via @changesets/cli — `@bradygaster/squad-sdk` and `@bradygaster/squad-cli` evolve on separate cadences
- **Structure:** Monorepo layout with workspace packages (SDK + CLI)
- **Directory:** `.squad/` directory structure (migration from `.ai-team/`)
- **Semantic Versioning:** All versions now comply with semver spec (prerelease format `X.Y.Z-preview.N`)

### Fixed
- CLI entry point moved from `dist/index.js` to `dist/cli-entry.js`. If you reference the binary directly, update your path. `npx` and `npm` bin resolution is unchanged. (#187)
- CRLF normalization: All parsers now normalize line endings before parsing. Windows users with `core.autocrlf=true` no longer get `\r`-tainted values. (#220, #221)
- `process.exit()` removed from library-consumable functions. VS Code extensions can now safely import CLI functions without risking extension host termination. (#189)
- Removed `.squad` branch protection guard (`squad-main-guard.yml`) — no longer needed with npm workspace `files` field exclusions

### Internal
- New utility: `normalizeEol()` in `src/utils/normalize-eol.ts`
- New entry point: `src/cli-entry.ts` (CLI bootstrap separated from library exports)
- Migrated to npm workspace publishing (`@bradygaster/squad-sdk`, `@bradygaster/squad-cli`)
- Changesets infrastructure for independent package versioning


