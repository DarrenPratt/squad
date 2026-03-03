# Decision: Versioning Model — npm Packages vs Public Repo

**Date:** 2026-03-03T02:45:00Z  
**Decided by:** Kobayashi (Git & Release specialist)  
**Related issues:** Migration prep, clarifying confusion between npm and public repo versions  
**Status:** Active — team should reference this in all future releases

## The Problem

The migration process had introduced confusion about which version number applies where:
- Coordinator incorrectly bumped npm package versions to 0.6.0, creating version mismatch
- Migration checklist had npm packages publishing as 0.6.0
- CHANGELOG treated 0.6.0 as an npm package version
- No clear distinction between "npm packages version" vs "public repo GitHub release tag"
- Risk of future mistakes during releases

## The Model (CORRECT)

Two distinct version numbers serve two distinct purposes:

### 1. npm Packages: `@bradygaster/squad-cli` and `@bradygaster/squad-sdk`

- **Follow semver cadence from current version:** Currently at 0.8.17 (published to npm)
- **Next publish after 0.8.17:** 0.8.18 (NOT 0.6.0)
- **Development versions:** Use `X.Y.Z-preview.N` format (e.g., 0.8.18-preview.1, 0.8.18-preview.2)
- **Release sequence per Kobayashi charter:**
  1. Pre-release: `X.Y.Z-preview.N` (development)
  2. At publish: Bump to `X.Y.Z` (e.g., 0.8.18), publish to npm, create GitHub release
  3. Post-publish: Immediately bump to next-preview (e.g., 0.8.19-preview.1)

**MUST NEVER:**
- Bump npm packages down (e.g., 0.8.17 → 0.6.0)
- Confuse npm package version with public repo tag

### 2. Public Repo (bradygaster/squad): GitHub Release Tag `v0.6.0`

- **Purpose:** Marks the migration release point for the public repository
- **Public repo version history:** v0.5.4 (final pre-migration) → v0.6.0 (migration release)
- **Applied to:** The migration merge commit on beta/main
- **Separate from npm versions:** v0.6.0 is NOT an npm package version
- **No package.json changes:** The tag is metadata only, not a code version change

## Why Two Version Numbers?

1. **npm packages evolve on their own cadence:** Independent development, independent release cycles (via @changesets/cli)
2. **Public repo is a release marker:** The v0.6.0 tag signals "here's the migration point" to users who clone the public repo
3. **They target different audiences:**
   - npm: Users who install via `npm install -g @bradygaster/squad-cli`
   - Public repo: Users who clone `bradygaster/squad` or interact with GitHub releases

## Impact on Migration Checklist & CHANGELOG

- **migration-checklist.md:** Fixed all references to npm packages — they publish as 0.8.18, not 0.6.0. Public repo tag is v0.6.0.
- **CHANGELOG.md:** Corrected [0.6.0] section to [0.8.18-preview]. CHANGELOG tracks npm package versions, not public repo tags.
- **Future releases:** Always clarify which version number you're talking about (npm cadence vs public repo tag)

## Known Issue: `scripts/bump-build.mjs`

The auto-increment build number script (`npm run build`) can produce invalid semver for non-prerelease versions:
- `0.6.0` + auto-increment → `0.6.0.1` (invalid)
- `0.8.18-preview.1` + auto-increment → `0.8.18-preview.2` (valid)

Since npm packages stay at 0.8.x cadence, this is not a blocker for migration. But worth noting for future patch releases.

## Directive Merged

Brady's directive (2026-03-03T02:16:00Z): "squad-cli and squad-sdk must NOT be bumped down to 0.6.0. They are already shipped to npm at 0.8.17."

✅ **Incorporated:** All fixes ensure npm packages stay at 0.8.x. The v0.6.0 is public repo only.

## Action Items for Team

- Reference this decision when asked "what version should we release?"
- Use this model for all future releases (main project and public repo)
- Update team onboarding docs to include this versioning distinction
