# Decision: v0.8.21 Release Unblock Strategy

**Date:** 2026-03-07T20:30:00Z  
**Author:** Kobayashi (Git & Release Agent)  
**Status:** Implemented (partial - awaiting Brady action)

## Context

Brady requested release of v0.8.21 to npm. Previous attempts failed with 2FA/OTP errors. Investigation revealed the GitHub Release was still in DRAFT status, preventing automation from triggering.

## Problem

v0.8.21 was properly tagged and merged to main, but npm publish workflow never triggered because:

1. GitHub Release was created as **DRAFT**
2. Draft releases do NOT emit `release.published` event
3. The `publish.yml` workflow triggers on `release.published` event
4. Therefore, automation never ran

## Analysis

### Pre-flight Checks Performed:
- ✅ Tag v0.8.21 exists and points to correct commit (bf86a32 on main)
- ✅ Package versions correct: main=0.8.21, dev=0.8.22-preview.1
- ✅ Commits on dev are post-release housekeeping only (no code to merge back)
- ❌ GitHub Release was in draft status
- ❌ NPM_TOKEN is user token with 2FA (automation blocker)

### Root Causes:
1. **Draft release:** Primary blocker - release needed to be published
2. **NPM_TOKEN type:** Secondary blocker - requires automation token

## Decision

**Immediate action taken:**
- Published GitHub Release v0.8.21 using `gh release edit v0.8.21 --draft=false`
- This triggered the `publish.yml` workflow (run #22806664280)

**Action required from Brady:**
- Replace NPM_TOKEN secret with automation token (no 2FA) to unblock npm publish

**Actions NOT taken (and why):**
- ❌ Did NOT merge dev → main (dev only has post-release housekeeping commits)
- ❌ Did NOT move tag (already in correct position)
- ❌ Did NOT create new tags (v0.8.21 already exists)
- ❌ Did NOT version bump (versions already correct)

## Outcome

**Completed:**
- GitHub Release published: https://github.com/bradygaster/squad/releases/tag/v0.8.21
- Publish workflow triggered successfully
- Clean release gate maintained (no unnecessary merges)

**Blocked:**
- npm publish still failing with error code EOTP (2FA/OTP required)
- Requires NPM_TOKEN secret update to automation token

## Learning

**Key insight:** GitHub Release draft status is NOT VISIBLE in standard git operations. Must explicitly check:
```bash
gh release view v0.8.21 --json isDraft
```

Draft releases are invisible to automation - always verify release publication status when debugging release pipeline failures.

## Next Steps

1. Brady updates NPM_TOKEN secret with automation token
2. Workflow automatically retries (or manual trigger with `gh workflow run publish.yml --ref v0.8.21`)
3. Packages publish to npm with provenance attestation
4. v0.8.21 becomes live version

## Related

- History: `.squad/agents/kobayashi/history.md` (Release v0.8.21 section)
- Workflow: `.github/workflows/publish.yml`
- npm token docs: https://docs.npmjs.com/creating-and-viewing-access-tokens
