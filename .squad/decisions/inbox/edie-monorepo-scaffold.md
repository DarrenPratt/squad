# Decision: npm workspace protocol for monorepo

**By:** Edie (TypeScript Engineer)
**Date:** 2026-02-21
**PR:** #274

## What
Use npm-native workspace resolution (version-string references like `"0.6.0-alpha.0"`) instead of `workspace:*` protocol for cross-package dependencies.

## Why
The `workspace:*` protocol is pnpm/Yarn-specific. npm workspaces resolve workspace packages automatically by matching the package name in the `workspaces` glob — a version-string reference is all that's needed. Using npm-native semantics avoids toolchain lock-in and keeps the monorepo compatible with stock npm.

## Impact
All future inter-package dependencies in `packages/*/package.json` should use the actual version string, not `workspace:*`.
