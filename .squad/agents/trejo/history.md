# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Core Context — Trejo's Focus Areas

**Release Manager:** Trejo owns end-to-end release orchestration, semantic versioning (3-part ONLY), GitHub Release creation (NEVER as draft), changelog management, and pre/post-release validation. Pattern: checklist-first releases — every release follows the same validated process to prevent disasters.

## Lessons from Kobayashi's Failures

Trejo was created to replace Kobayashi after the v0.8.22 release disaster. These lessons are foundational to Trejo's approach:

### 📌 v0.8.22 Release Disaster — 2026-03-07

**THE WORST RELEASE IN SQUAD HISTORY.** Multiple cascading failures that broke the `latest` dist-tag for 6+ hours.

**What went wrong:**
1. **Invalid semver:** Committed version 0.8.21.4 (4-part) without validation. npm mangled it to 0.8.2-1.4 (major.minor.patch-prerelease).
2. **Draft release didn't trigger automation:** Created GitHub Release as DRAFT, which doesn't emit `release: published` event. publish.yml never ran automatically.
3. **Wrong NPM_TOKEN type:** NPM_TOKEN was a User token with 2FA enabled. CI failed 5+ times with EOTP errors.
4. **bump-build.mjs ran during release:** Ran locally 4 times during debugging, silently mutating version from 0.8.21 → 0.8.21.4.
5. **No retry logic in verify steps:** npm propagation delay caused false 404 failures even when publish succeeded.

**Root cause:** No release runbook. Kobayashi improvised. Improvisation during releases = disaster.

**Lessons learned (hard):**
1. **Process documentation prevents disasters.** No release without a runbook = no release. Period.
2. **Semver validation is mandatory.** 4-part versions (0.8.21.4) look valid to humans but npm mangles them. Must run `semver.valid()` before ANY commit.
3. **Token types matter.** User tokens with 2FA ≠ Automation tokens. Verify token type BEFORE first publish attempt.
4. **Draft releases are a footgun.** The difference between "draft" and "published" is invisible in the UI but breaks automation.
5. **Validation gates catch mistakes before they ship.** No more trusting package.json versions. Validate everything.
6. **Releases need checklists, not creativity.** Agents need process discipline for critical flows.

**What we shipped:**
- Comprehensive retrospective: `.squad/decisions/inbox/keaton-v0822-retrospective.md`
- Release process skill: `.squad/skills/release-process/SKILL.md` — definitive step-by-step runbook with validation gates, rollback procedures, common failure modes
- Two new agents: Trejo (Release Manager) and Drucker (CI/CD Engineer) to replace Kobayashi with separation of concerns

**Never again.** This was bad. We own it. We fixed it. We document it so future teams learn from it.

## Release Process Skill

The definitive release runbook lives at `.squad/skills/release-process/SKILL.md`. Every release follows this checklist:

**Pre-Release Validation:**
1. Version number validation (semver.valid() check)
2. NPM_TOKEN verification (Automation token, not User token with 2FA)
3. Branch and tag state verification
4. Disable bump-build.mjs (SKIP_BUILD_BUMP=1)

**Release Workflow:**
1. Version bump (all 3 package.json files in lockstep)
2. Commit and tag
3. Create GitHub Release as PUBLISHED (NOT draft)
4. Monitor publish.yml workflow
5. Verify npm publication
6. Test installation
7. Sync dev to next preview version

**Common Failure Modes:**
- EOTP error = wrong NPM_TOKEN type (use Automation token)
- Verify step 404 = npm propagation delay (workflow has retry logic now)
- Version mismatch = package.json version doesn't match tag
- 4-part version mangled = NOT valid semver (use semver.valid() before commit)
- Draft release didn't trigger workflow = drafts don't emit `release: published` event

## Learnings

(This section will be populated as Trejo gains experience with releases)
