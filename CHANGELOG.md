# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.6.0-alpha.0] - 2026-02-22

### Breaking Changes
- CLI entry point moved from `dist/index.js` to `dist/cli-entry.js`. If you reference the binary directly, update your path. `npx` and `npm` bin resolution is unchanged. (#187)

### Fixed
- CRLF normalization: All 8 parsers now normalize line endings before parsing. Windows users with `core.autocrlf=true` no longer get `\r`-tainted values. (#220, #221)
- `process.exit()` removed from library-consumable functions. VS Code extensions can now safely import CLI functions without risking extension host termination. (#189)
- Removed `.squad` branch protection guard (`squad-main-guard.yml`) — no longer needed with npm workspace `files` field exclusions

### Internal
- New utility: `normalizeEol()` in `src/utils/normalize-eol.ts`
- New entry point: `src/cli-entry.ts` (CLI bootstrap separated from library exports)
- Migrated to npm workspace publishing (`@bradygaster/squad-sdk`, `@bradygaster/squad-cli`)

## [0.6.0] - 2026-02-21

### Added
- Interactive shell entry point: `squad` with no args launches the REPL
- Shell chrome with version from `package.json` (no hardcoded strings)
- Session registry for agent state tracking
- `ensureSquadPath()` guard for write validation
- npm-based distribution: `npm install @bradygaster/squad-cli`
- Changesets infrastructure for independent package versioning
- Branch protection on `main` (require PR + build check)

### Changed
- Default command changed from `squad init` to `squad shell`
- Distribution deprecated GitHub-native path in favor of npm
- Help output updated to reflect npm-based installation
- README restructured for npm-first installation path

### Fixed
- Strict TypeScript compliance across all files
- ESM module resolution aligned with Node.js >=20
