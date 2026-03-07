# v0.8.22 Release Disaster — Retrospective

**Date:** 2026-03-07  
**Author:** Keaton (Lead)  
**Severity:** Critical — Production release completely broken, npm `latest` tag pointed to a mangled phantom version for 6+ hours

---

## What Happened

The v0.8.22 release was a catastrophe. Here's the timeline of failures:

1. ✅ Version bumped to 0.8.21, tagged, all looked good
2. ❌ **GitHub Release created as DRAFT** — the `release: published` event never fired, so `publish.yml` never ran automatically
3. ❌ **NPM_TOKEN was a user token with 2FA** — CI can't provide OTP, so 5+ workflow runs failed with EOTP errors
4. ✅ Brady saved a new Automation token (no 2FA required)
5. ❌ Draft release was published, but damage already done
6. ❌❌❌ **`bump-build.mjs` ran locally 4 times**, silently mutating versions from `0.8.21` → `0.8.21.1` → `0.8.21.2` → `0.8.21.3` → `0.8.21.4`
7. ❌❌❌ **Kobayashi committed 0.8.21.4 to main without validation** — 4-part version is NOT valid semver
8. ❌❌❌ **npm MANGLED 0.8.21.4 into 0.8.2-1.4** (major.minor.patch-prerelease). This went to the npm registry. The `latest` dist-tag pointed to a phantom version that was never intended. Anyone running `npm install @bradygaster/squad-sdk` got version `0.8.2-1.4` — a version that doesn't exist in our repo.
9. ❌ Verify step in publish.yml failed (npm propagation delay + mangled version 404), blocking CLI publish
10. ✅ Cleanup: reverted commit, deleted tag and release, manually published 0.8.21 via workflow_dispatch (SDK succeeded, CLI blocked by verify failure)
11. ✅ Fixed: bumped to 0.8.22, added retry loop to verify step, published successfully

**Impact:**  
- `latest` dist-tag broken for 6+ hours  
- Community saw 5+ failed workflow runs  
- Emergency manual intervention required  
- Trust damage  

---

## Root Causes (5 Whys)

### 1. Draft Release Never Triggered Publish

**Why did publish.yml not run automatically?**  
GitHub Release was created as a draft. Draft releases don't emit `release: published` events.

**Why was it created as a draft?**  
Kobayashi (agent) defaulted to draft mode without understanding the automation dependency.

**Why didn't we catch this?**  
No documented release process. Agents were improvising.

**Root cause:** No release runbook. No validation that GitHub Release creation would trigger the publish workflow.

---

### 2. Wrong NPM_TOKEN Type

**Why did 5+ workflow runs fail with EOTP?**  
NPM_TOKEN was a user token with 2FA enabled. CI can't provide OTP.

**Why was a user token configured?**  
Token type wasn't documented. Nobody knew Automation tokens exist.

**Why didn't we catch this before the release?**  
No pre-release checklist. No token validation step.

**Root cause:** No NPM_TOKEN validation in the release process. No documentation of correct token type (Automation token, no 2FA).

---

### 3. Invalid Semver from bump-build.mjs

**Why did npm mangle 0.8.21.4 into 0.8.2-1.4?**  
4-part versions (major.minor.patch.build) are NOT valid semver. npm's parser misinterpreted it as `0.8.2-1.4`.

**Why was 0.8.21.4 committed?**  
`bump-build.mjs` ran locally 4 times during debugging, incrementing the build number each time.

**Why did the script run 4 times?**  
No protection against local runs during release. The script is intended for dev builds, NOT release builds.

**Why didn't we catch the invalid version before publish?**  
No validation gate. Kobayashi committed the version without checking if it was valid semver.

**Root cause:** `bump-build.mjs` has no safeguards against running during release. No version validation before commit/tag/publish.

---

### 4. No Version Validation Gate

**Why did Kobayashi commit 0.8.21.4 to main?**  
No validation that the version was valid semver.

**Why didn't we have validation?**  
No release checklist. No automated gate to block invalid versions.

**Root cause:** No semver validation step in the release process. Agents trusted whatever version was in package.json.

---

### 5. Verify Step Had No Retry Logic

**Why did the verify step fail even when publish succeeded?**  
npm registry has propagation delay (5-30 seconds). The verify step ran immediately after publish and got a 404.

**Why didn't we have retry logic?**  
Original implementation assumed immediate propagation.

**Root cause:** No retry logic in the verify step. Should have retried with exponential backoff for up to 75 seconds.

---

## Action Items

### Immediate (v0.8.22 Hotfix) — ✅ DONE

- [x] Add retry loop to verify step in publish.yml (5 attempts, 15s interval) — **COMPLETED**
- [x] Bump to 0.8.22, publish successfully — **COMPLETED**
- [x] Sync dev to 0.8.23-preview.1 — **COMPLETED**

### Short-Term (v0.8.23)

**Owner: Keaton (Lead)**

- [ ] Write release process skill document (`.squad/skills/release-process/SKILL.md`) with step-by-step checklist — **IN THIS RETROSPECTIVE**
- [ ] Add semver validation to `bump-build.mjs` — reject 4-part versions, log warning
- [ ] Add `RELEASE_MODE=1` env var check to `bump-build.mjs` — skip in release mode
- [ ] Document NPM_TOKEN requirements in `.squad/decisions.md` (Automation token, no 2FA)

**Owner: Kobayashi (DevOps)**

- [ ] Add GitHub CLI check before GitHub Release creation: `gh release view {tag}` to verify it's NOT a draft
- [ ] Add pre-release validation script: `scripts/validate-release.mjs` (checks versions are valid semver, NPM_TOKEN type, GitHub Release is NOT draft)

**Owner: All Agents**

- [ ] Read `.squad/skills/release-process/SKILL.md` before ANY release work
- [ ] NEVER commit a version without running `node -p "require('semver').valid('VERSION')"` first

### Long-Term (v0.9.0+)

- [ ] Add `npm run release` command that orchestrates the entire release flow (version bump, tag, GitHub Release, publish verification)
- [ ] Add `npm run release:dry-run` for simulation
- [ ] Add GitHub Actions workflow guard: if tag exists, verify it's NOT a draft release before running publish.yml

---

## Process Changes

### 1. Release Runbook

Created `.squad/skills/release-process/SKILL.md` with the definitive step-by-step release checklist. This is now the ONLY way to release Squad.

**Rule:** No agent releases without following the runbook. No exceptions.

### 2. Semver Validation Gate

**Before ANY version commit:**
```bash
node -p "require('semver').valid('0.8.21.4')"  # null = invalid, reject immediately
```

**Rule:** If `semver.valid()` returns `null`, STOP. Version is invalid. Fix it before proceeding.

### 3. NPM_TOKEN Documentation

**Correct token type:** Automation token (no 2FA required)  
**How to verify:** `npm token list` — look for `read-write` tokens with no 2FA requirement  
**How to create:** `npm login` → Settings → Access Tokens → Generate New Token → **Automation**

**Rule:** User tokens with 2FA are NOT suitable for CI. Only Automation tokens.

### 4. GitHub Release Creation

**Rule:** NEVER create a GitHub Release as a draft if you want `publish.yml` to run automatically.

**How to verify:** `gh release view {tag}` — output should NOT contain `(draft)`

### 5. bump-build.mjs Protection

**Rule:** `bump-build.mjs` MUST NOT run during release builds. It's for dev builds only.

**Implementation:** Add `SKIP_BUILD_BUMP=1` env var (already exists, line 20). CI sets this. Local release flow must set this too.

---

## Lessons Learned

### For Keaton (Lead)

1. **No release runbook = disaster.** Agents improvise badly under pressure. Document the entire flow, every step, every validation.
2. **Assume agents don't know npm internals.** 4-part versions look valid to a human, but npm mangles them. Validation gates are mandatory.
3. **Draft releases are a footgun.** The difference between "draft" and "published" is invisible in the UI but breaks automation. Document this.
4. **Token types matter.** User tokens ≠ Automation tokens. This should have been in `.squad/decisions.md` from day one.

### For Kobayashi (DevOps)

1. **Validate before commit.** Never trust versions in package.json. Run `semver.valid()` before any commit/tag/release.
2. **Check GitHub Release state.** Use `gh release view {tag}` to verify it's published, not draft.
3. **Read the retry logic.** The verify step now has retry logic. Understand why it's there (npm propagation delay).

### For All Agents

1. **Stop when confused.** If you don't know how a release flow works, STOP and ask Brady. Don't improvise.
2. **Follow the skill document.** `.squad/skills/release-process/SKILL.md` is now the source of truth. Read it. Follow it. Don't skip steps.
3. **Semver is strict.** 4-part versions are NOT valid. 3-part only (major.minor.patch) or 3-part + prerelease (major.minor.patch-tag.N).

---

## Conclusion

This release was a disaster. The root cause wasn't a single mistake — it was a systemic lack of process documentation and validation gates. We improvised our way into breaking production.

**What we fixed:**
- Retry logic in verify step (immediate hotfix)
- Release process skill document (this retrospective)
- Semver validation requirements (documented)
- NPM_TOKEN type documented (Automation token only)
- GitHub Release draft footgun documented (never draft for auto-publish)

**What we learned:**
- Process documentation prevents disasters
- Validation gates catch mistakes before they ship
- Agents need checklists, not autonomy, for critical flows

**Brady's take:** This was bad. We own it. We fixed it. We won't repeat it.

---

**Status:** Retrospective complete. Action items assigned. Release process skill document written.
