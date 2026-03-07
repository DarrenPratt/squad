# Release Guardrails — v0.8.22 Incident Prevention

**Date:** 2026-03-XX
**Proposed by:** Kobayashi (Git & Release)
**Context:** v0.8.22 release incident — multiple failures due to missing validation

## Problem

The v0.8.22 release attempt exposed critical gaps in the release validation process:

1. **Invalid semver committed:** 4-part version (0.8.21.4) committed to main — npm mangled it to 0.8.2-1.4
2. **Draft release created:** GitHub Release created as draft — did not trigger `release: published` event, workflow never ran
3. **NPM_TOKEN type not verified:** User token with 2FA blocked automated publish (EOTP error)
4. **Multiple corrections required:** Brady had to intervene repeatedly to fix invalid state

**Root cause:** No pre-flight validation checklist. Released under pressure without verifying preconditions.

## Proposed Guardrails

### 1. Pre-Publish Semver Validation

**Add validation step to `publish.yml` workflow:**

```yaml
- name: Validate semver format
  run: |
    VERSION="${{ github.event.release.tag_name || inputs.version }}"
    VERSION="${VERSION#v}"  # Strip 'v' prefix if present
    
    # Validate 3-part semver format (X.Y.Z or X.Y.Z-prerelease)
    if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?$'; then
      echo "❌ Invalid semver format: $VERSION"
      echo "✅ Valid formats: X.Y.Z or X.Y.Z-prerelease.N"
      echo "❌ Invalid formats: X.Y.Z.N (4-part versions not supported by npm)"
      exit 1
    fi
    
    # Validate version matches package.json
    PKG_VERSION=$(node -p "require('./package.json').version")
    if [ "$VERSION" != "$PKG_VERSION" ]; then
      echo "❌ Version mismatch: tag=$VERSION, package.json=$PKG_VERSION"
      exit 1
    fi
    
    echo "✅ Version $VERSION is valid semver"
```

**Benefits:**
- Catches 4-part versions before npm publish
- Validates version matches package.json
- Fails fast with clear error message

### 2. GitHub Release Draft Prevention

**Option A — Enforce `--draft=false` in creation:**
```bash
gh release create "v${VERSION}" \
  --title "v${VERSION}" \
  --notes-file CHANGELOG.md \
  --draft=false  # Explicit non-draft flag
```

**Option B — Add verification step after creation:**
```yaml
- name: Verify release is published
  run: |
    TAG="${{ github.event.release.tag_name }}"
    DRAFT=$(gh release view "$TAG" --json isDraft --jq '.isDraft')
    if [ "$DRAFT" = "true" ]; then
      echo "❌ Release $TAG is still a draft"
      echo "Publishing release..."
      gh release edit "$TAG" --draft=false
    fi
```

**Benefits:**
- Ensures `release: published` event fires
- Catches accidental draft creation
- Self-correcting (Option B)

**Recommendation:** Use Option A (explicit flag) + Option B (verification) for defense in depth.

### 3. NPM_TOKEN Type Verification

**Add token validation step to `publish.yml`:**

```yaml
- name: Validate NPM token type
  run: |
    # Test token with dry-run publish
    npm publish --dry-run --access public 2>&1 | tee npm-test.log
    
    # Check for 2FA/OTP error
    if grep -q "EOTP" npm-test.log || grep -q "one-time password" npm-test.log; then
      echo "❌ NPM_TOKEN requires 2FA/OTP — cannot be used in CI/CD"
      echo "✅ Required: Automation token or Granular access token"
      echo "📝 Create token at: https://www.npmjs.com/settings/bradygaster/tokens"
      exit 1
    fi
    
    echo "✅ NPM_TOKEN is valid for automated publishing"
```

**Benefits:**
- Detects user tokens with 2FA before publish attempt
- Fails with actionable error message
- Zero risk (dry-run only)

**Alternative:** Document token requirements in README and trust setup. (Less safe but simpler.)

### 4. Release Runbook Skill

**Create `.squad/skills/release-process/SKILL.md`:**

```markdown
# Release Process Skill

## Pre-Flight Checklist

Before starting a release:

- [ ] Version is valid 3-part semver (X.Y.Z or X.Y.Z-prerelease.N)?
- [ ] Version matches across all package.json files?
- [ ] NPM_TOKEN secret is automation token (not user with 2FA)?
- [ ] Will create GitHub Release as PUBLISHED (not draft)?
- [ ] All tests passing on main/dev branch?
- [ ] CHANGELOG.md updated for this version?

## Release Steps

1. **Version bump:** Commit new version to package.json files
2. **Tag creation:** `git tag -a v{VERSION} -m "Release v{VERSION}"`
3. **Push tag:** `git push origin v{VERSION}`
4. **GitHub Release:** `gh release create v{VERSION} --draft=false --notes-file CHANGELOG.md`
5. **Wait for publish:** Monitor workflow at https://github.com/bradygaster/squad/actions
6. **Verify npm:** Check packages at npmjs.com/@bradygaster/squad-cli and squad-sdk
7. **Post-release bump:** Bump dev branch to {NEXT}-preview.1

## Rollback Procedures

**If semver invalid:**
1. Delete tag: `git tag -d v{VERSION} && git push origin :refs/tags/v{VERSION}`
2. Revert commit: `git revert {commit}`
3. Fix version and retry

**If npm publish fails:**
1. Check workflow logs for error
2. Fix error (token, version, etc.)
3. Re-trigger: `gh workflow run publish.yml --ref v{VERSION}`

**If wrong version published:**
1. Within 72 hours: `npm unpublish @bradygaster/squad-cli@{VERSION}`
2. After 72 hours: Publish corrected version with patch bump

## Known Failure Modes

See `.squad/agents/kobayashi/charter.md` Failure 3 for complete incident report.
```

**Benefits:**
- Single source of truth for release process
- Includes pre-flight checklist
- Documents rollback procedures
- Can be loaded on-demand by coordinator

## Implementation Priority

**High priority (implement now):**
1. ✅ Pre-publish semver validation (5 min, zero risk)
2. ✅ GitHub Release draft verification (10 min, self-correcting)

**Medium priority (implement before next release):**
3. ⚠️ NPM_TOKEN type verification (15 min, requires dry-run testing)

**Low priority (nice-to-have):**
4. 📝 Release runbook skill (30 min, documentation effort)

## Backward Compatibility

**Zero breaking changes:**
- All changes are additive (new validation steps)
- Existing valid releases will pass all checks
- Invalid releases will now fail fast (intended behavior)

## Testing Strategy

**Validation steps:**
1. Test with valid semver: 0.8.22 → should pass
2. Test with 4-part version: 0.8.21.4 → should FAIL with clear error
3. Test with version mismatch: tag=0.8.22, package.json=0.8.21 → should FAIL
4. Test with draft release → should auto-publish or fail with actionable message

**NPM token test:**
1. Create test automation token on npmjs.com
2. Configure in repo secrets
3. Run dry-run publish → should pass
4. Switch to user token with 2FA → should FAIL with EOTP error message

## Success Metrics

**Before:**
- v0.8.22 incident: 4+ failures, multiple Brady interventions, hours to resolve

**After:**
- Invalid semver caught in CI before reaching npm
- Draft releases auto-corrected or blocked
- Token issues detected before first publish attempt
- Release process completes in <10 minutes with zero manual intervention

## Decision Request

**Approve these guardrails for immediate implementation?**

- [ ] Approve all (implement now)
- [ ] Approve high-priority only (defer medium/low)
- [ ] Request changes (specify below)

**Brady's decision:**
