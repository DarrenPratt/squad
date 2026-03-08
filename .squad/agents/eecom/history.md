# EECOM

> Environmental, Electrical, and Consumables Manager

## Learnings

### CLI Entry Point Architecture
cli-entry.ts is the central router for ~30+ CLI commands using dynamic imports (lazy-loading). Commands are routed via if-else blocks. Has a recurring "unwired command" bug class — implementations exist in cli/commands/ but aren't routed in cli-entry.ts. The cli-command-wiring.test.ts regression test catches this by verifying every .ts file in cli/commands/ is imported.

### ESM Runtime Patch
Module._resolveFilename interceptor in cli-entry.ts (lines 47-54) patches broken ESM import in @github/copilot-sdk@0.1.32 (vscode-jsonrpc/node missing .js extension). Required for Node 24+ strict ESM enforcement. Works on npx cache hits where postinstall scripts don't run.

### Lazy Import Pattern
All command imports use `await import('./cli/commands/xxx.js')` to minimize startup time. Copilot SDK is lazily loaded only when shell is invoked. All .js extensions required for Node 24+ strict ESM.

### CLI Packaging & Distribution
`npm pack` produces a complete, installable tarball (~275KB packed, 1.2MB unpacked). Package includes dist/, templates/, scripts/, README.md per package.json "files" field. Postinstall script (patch-esm-imports.mjs) patches @github/copilot-sdk for Node 24+ compatibility. Tarball can be installed locally (`npm install ./tarball.tgz`) and commands execute via `node node_modules/@bradygaster/squad-cli/dist/cli-entry.js`. Both squad-cli and squad-sdk must be installed together — cli depends on sdk with "*" version specifier. All 27+ CLI commands are lazy-loaded at runtime; `--help` validates command routing without executing full logic.

### Packaging Smoke Test Strategy
test/cli-packaging-smoke.test.ts validates the packaged artifact (not source). Uses npm pack + install in temp dir + command routing verification. Commands are expected to fail (no .squad/ dir) — test verifies routing only (no "Unknown command", no MODULE_NOT_FOUND for the command itself). Exception: node-pty is an optional dependency for the `start` command and MODULE_NOT_FOUND for node-pty is allowed. Windows cleanup requires retry logic due to EBUSY errors — use rmSync with maxRetries + retryDelay options, wrap in try/catch to fail silently since tests have passed.
