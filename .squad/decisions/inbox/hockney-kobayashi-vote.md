# Hockney's Vote: Kobayashi Review

**Date:** 2026-03-07  
**Reviewer:** Hockney (Tester)  
**Subject:** Should Kobayashi stay on the team?  
**Vote:** REPLACE

---

## Quality Assessment

From a quality and testing perspective, Kobayashi's release process has **systemic validation gaps** that have caused production failures.

### Documented Failures

**Failure 1: Invalid Semver (v0.8.21.4)**
- Published 4-part version number (0.8.21.4) to npm
- npm mangled it to 0.8.2-1.4 — **corrupted the package registry**
- No pre-commit validation caught this despite semver being a well-known constraint

**Failure 2: Draft Release Detection**
- Created GitHub Release as DRAFT instead of published
- Automation never triggered because `release.published` event never fired
- No validation step to verify release state before proceeding

**Failure 3: NPM_TOKEN Type Validation**
- Used user token with 2FA instead of automation token
- All publish attempts failed with EOTP error
- No pre-flight token capability check

**Pattern:** All three failures share the same root cause — **zero automated validation before destructive operations.**

---

## The Real Problem

This is **NOT** a tooling problem OR an agent-specific problem. This is a **process design failure.**

### What's Missing

The release process has:
- ❌ No semver format validation gate
- ❌ No draft/published release state check
- ❌ No NPM token capability verification
- ❌ No pre-flight checklist enforcement
- ❌ No smoke tests before npm publish
- ❌ No rollback procedure

Kobayashi's charter says "Zero tolerance for state corruption" but the process he owns **has no automated safeguards against state corruption.**

### The Kobayashi Paradox

From charter.md:
> "Zero tolerance for state corruption — if .squad/ state gets corrupted, everything breaks"

Yet he:
1. Corrupted npm registry with phantom version 0.8.2-1.4
2. Has no validation gates in the release workflow
3. Required Brady to manually fix corrupted state multiple times

**You can't have zero tolerance for state corruption without automated guards that PREVENT corruption.**

---

## Is This Fixable?

YES — but not by Kobayashi alone.

### What We Need (Automated Quality Gates)

**Pre-Commit Gates:**
```bash
# In publish.yml BEFORE any destructive ops
1. Validate semver format (X.Y.Z or X.Y.Z-prerelease only)
2. Verify all package.json versions match release tag
3. Check NPM_TOKEN type (must be automation, not user+2FA)
4. Verify git tag points to correct commit SHA
5. Smoke test: npm install --dry-run from tarball
```

**Pre-Publish Gates:**
```bash
# After GitHub Release created
1. Verify release is published (not draft)
2. Verify workflow trigger conditions met
3. Test npm credentials with whoami
4. Publish with --dry-run first
5. Verify package appears in npm registry
6. Verify version string matches expected
```

**Rollback Procedure:**
```bash
# When release fails
1. Document failure mode
2. Unpublish bad versions (npm unpublish within 72hr window)
3. Delete bad tags (git push origin :refs/tags/bad-tag)
4. Re-version and retry
```

These gates should be **CI enforced**, not agent-enforced. Humans (and agents) make mistakes. Automation doesn't.

---

## Vote Rationale

### Why REPLACE (not KEEP)

1. **Repeatability:** Kobayashi has failed 3 times with the same pattern (no validation). This suggests the problem is not fixable by "trying harder" — it requires a different approach.

2. **Charter Violation:** Kobayashi's charter explicitly states "Zero tolerance for state corruption" but he has repeatedly corrupted state. His actions contradict his stated values.

3. **Quality Culture:** A release agent must model quality-first thinking. Kobayashi's failures show "ship fast, fix later" thinking — the opposite of what a release gate owner should embody.

4. **Single Point of Failure:** The release process should NOT be a single agent's responsibility. This is a shared responsibility requiring automated gates + multiple reviewers.

### What We Need Instead

**Option A: Dedicated Release Engineer**
- Someone with production ops experience
- Deep understanding of npm, semver, CI/CD failure modes
- Track record of building automated validation pipelines
- Follows "trust but verify" principle

**Option B: Distributed Release Ownership**
- No single "release agent"
- Release checklist enforced by CI (blocked if checklist incomplete)
- Multiple reviewers required for version bumps
- Automated validation gates in publish.yml

**I recommend Option B.** Releases are too critical to trust to a single agent without automated safeguards.

---

## Required Changes (If Kobayashi Stays)

If the team decides to keep Kobayashi despite my recommendation, the following are **MANDATORY:**

### Automated Gates (Must-Have)

1. **Pre-Commit Validation Script** (`scripts/validate-release.sh`)
   - Semver format check
   - Package.json version consistency check
   - NPM_TOKEN type verification
   - Git tag validation
   - Must pass BEFORE any commit to main

2. **publish.yml Hardening**
   - Add semver validation step (fail if 4-part version)
   - Add draft detection step (fail if release is draft)
   - Add NPM token smoke test (npm whoami --registry)
   - Add dry-run publish step
   - Add post-publish verification step

3. **Rollback Runbook**
   - Document exact steps to undo bad release
   - Test rollback procedure in staging
   - Keep runbook in `.squad/skills/release-rollback/`

### Process Changes (Must-Have)

1. **No solo releases:** All releases require 2-agent review (Kobayashi + 1 other)
2. **Staging environment:** Test full release flow in non-prod before prod
3. **Post-mortem requirement:** Every release failure gets a documented root cause analysis
4. **Quarterly release audit:** Review all failures, update validation gates

### Measurement (Success Criteria)

- 🎯 **Target:** Zero invalid versions published to npm (12 months)
- 🎯 **Target:** Zero draft release incidents (12 months)
- 🎯 **Target:** 100% of releases pass pre-flight validation on first attempt
- 🎯 **Target:** Zero rollbacks required due to validation failures

If Kobayashi cannot achieve these targets with automated gates in place, **replacement is non-negotiable.**

---

## Final Judgment

Kobayashi's charter promises "Zero tolerance for state corruption" but his track record shows **zero automated prevention of state corruption.**

You can't QA quality into a broken process. The release process needs automated validation gates that don't exist today.

**My vote: REPLACE Kobayashi and implement Option B (distributed release ownership with automated gates).**

If the team chooses to keep Kobayashi, the automated gates I've outlined are **non-negotiable** — and I will personally write the test suite to enforce them.

---

**Hockney**  
Tester • Quality Gate Owner  
*"If it can break, I'll find how — and prevent it from breaking again."*
