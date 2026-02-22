# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- Preview branch workflow: two-phase (preview → ship) for safe releases
- State integrity via merge drivers: union strategy for .squad/ append-only files
- .gitattributes merge=union: decisions.md, agents/*/history.md, log/**, orchestration-log/**
- Distribution: GitHub-native (npx github:bradygaster/squad), never npmjs.com
- Zero tolerance for state corruption — .squad/ state is the team's memory

### 2026-02-21: Issue #208 — @changesets/cli setup complete
**Status:** PR #276 merged.
- Installed @changesets/cli v2 (101 new packages)
- Config: `"access": "public"`, `"baseBranch": "main"`
- Fixed/linked arrays left empty → independent versioning (squad-sdk, squad-cli evolve at different cadences)
- Added npm script `changeset:check: "changeset status"` for CI validation
- Build passes, npm workspace resolution confirmed
- **Decision:** Independent versioning is correct. Squad packages have separate release cycles (SDK is runtime; CLI is tooling).

### 📌 Team update (2026-02-21T22:05Z): M3+ decisions merged — decided by Kobayashi, Fenster
- Changesets setup (#208): independent versioning for squad-sdk + squad-cli, PR #276 merged
- --global flag (#212) + squad status (#213): routing in src/index.ts, composable resolution pattern, PR #277 merged
- Decision consolidation: changesets config and --global pattern appended to decisions.md

### 📌 Team update (2026-02-21T22:25Z): M5 round complete — decided by Scribe
- Decision inbox merged: ensureSquadPath() guard (#273), CLI routing testability pattern
- Status: Two PRs merged (#280, #279); one issue blocked (#209 needs GitHub Pro)

### 2026-02-21: Issue #215 — Insider channel publish scaffolds
**Status:** PR #283 opened → bradygaster/dev
- Added minimal publishable entry points to both workspace packages:
  - `packages/squad-sdk/src/index.ts`: VERSION export placeholder
  - `packages/squad-cli/src/cli.ts`: placeholder binary entry point
  - Both: `tsconfig.json` extending root, `build` scripts, `files` lists for npm publish
- Root `build` script updated to chain `--workspaces --if-present`
- Build passes (root + workspaces), all 1621 tests pass
- **Does NOT push to insider.** PR only — coordinator handles insider branch push after merge.
- **Package structure:** ESM-only, strict mode, Node >=20. squad-cli depends on squad-sdk via version string (npm workspace protocol, per Edie's decision).

### 2026-02-21: Version Alignment — 0.7.0 stubs → 0.8.0 real code
**Status:** EXECUTED
- **Decision:** Bump both packages from 0.7.0 (npm stubs) to 0.8.0 (real, publishable code)
- **Rationale:** Clear break from placeholders. 0.8.0 signals functional code arrival while preserving pre-1.0 alpha status.
- **Changes:**
  - `packages/squad-sdk/package.json` → version `0.8.0`, VERSION export updated in `src/index.ts`
  - `packages/squad-cli/package.json` → version `0.8.0`, dependency on sdk locked to `0.8.0`
  - `package.json` (root) → added `"private": true` (safety guard against accidental publish)
- **Verification:** All three version strings aligned. CLI SDK dependency pinned. Pre-existing TS build errors unrelated to alignment.
- **Next:** Changeset + npm publish (when TS issues resolved). Decision document: `.squad/decisions/inbox/kobayashi-version-alignment.md`

### 📌 Team update (2026-02-22T041800Z): Version alignment complete, both packages published to npm at 0.8.0 — decided by Kobayashi, Coordinator
Kobayashi aligned all version strings to 0.8.0 (SDK package, CLI package, VERSION export, root private flag). Coordinator published @bradygaster/squad-sdk@0.8.0 and @bradygaster/squad-cli@0.8.0 to npm registry. Version bump signals clear break from 0.7.0 stubs. Release infrastructure production-ready. Both packages live and resolvable on npm.
