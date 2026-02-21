# Project Context

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
- npm uses version-string workspace references (`"0.6.0-alpha.0"`) not `workspace:*` protocol (that's pnpm/Yarn)
- Build clean, 1592/1592 tests still pass — no source files moved, scaffold only
- PR #274, branch `squad/197-monorepo-scaffold`, closes #197, #198, #200
