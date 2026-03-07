# Decision Proposal: npm Version Safety Guards

**By:** Rabin (Distribution)  
**Date:** 2026-03-07  
**Status:** Proposed

## Context

During the v0.8.22 release, a catastrophic npm publishing error occurred:
- Version `0.8.21.4` (invalid 4-part semver) was published to npm
- npm silently mangled it to `0.8.2-1.4` (interpreting the 4th segment as a prerelease identifier: `major.minor.patch-prerelease`)
- The `latest` dist-tag briefly pointed to this mangled version
- v0.8.22 has been published successfully, fixing the `latest` tag
- The mangled version `0.8.2-1.4` remains in the registry for both packages

**Current state verified (2026-03-07):**
- `@bradygaster/squad-sdk`: `latest` → `0.8.22` ✅
- `@bradygaster/squad-cli`: `latest` → `0.8.22` ✅
- Mangled version `0.8.2-1.4` still published for squad-sdk (not for squad-cli)

## Problem

1. **Silent mangling:** npm does NOT reject invalid semver versions. It silently reinterprets them, causing unexpected version strings to appear in the registry.
2. **Immediate user impact:** The `latest` dist-tag updates automatically on publish. A bad publish immediately affects all users running `npm install` or `npx`.
3. **No rollback:** Once published, npm packages are immutable. You cannot unpublish or overwrite a version (except within 72 hours for versions with zero downloads).
4. **Verification gap:** Current publish workflow has no post-publish verification step to catch these issues.

## Proposed Solution

### 1. Pre-publish semver validation

Add a validation step to BOTH publish workflows (`squad-publish.yml` and `squad-insider-publish.yml`) BEFORE `npm publish`:

```yaml
- name: Validate semver versions
  run: |
    SDK_VERSION=$(node -p "require('./packages/squad-sdk/package.json').version")
    CLI_VERSION=$(node -p "require('./packages/squad-cli/package.json').version")
    
    # Validate SDK version
    if ! npx semver "$SDK_VERSION" >/dev/null 2>&1; then
      echo "❌ ERROR: Invalid semver version for squad-sdk: $SDK_VERSION"
      exit 1
    fi
    
    # Validate CLI version
    if ! npx semver "$CLI_VERSION" >/dev/null 2>&1; then
      echo "❌ ERROR: Invalid semver version for squad-cli: $CLI_VERSION"
      exit 1
    fi
    
    echo "✅ Versions validated: SDK=$SDK_VERSION, CLI=$CLI_VERSION"
```

**Why:** Fail fast at CI time, not after the damage is done. The `semver` package (from npm itself) provides authoritative semver validation.

### 2. Add publishConfig to package.json files

Add explicit `publishConfig` sections to both `packages/squad-sdk/package.json` and `packages/squad-cli/package.json`:

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
}
```

**Why:** 
- Makes publish configuration explicit and auditable
- Prevents accidental publishes to wrong registry or tag
- Documents intended publish behavior in the package itself

### 3. Post-publish verification with retry logic

Add a verification step AFTER `npm publish` that checks the ACTUAL published version matches the INTENDED version:

```yaml
- name: Verify published versions
  run: |
    SDK_VERSION=$(node -p "require('./packages/squad-sdk/package.json').version")
    CLI_VERSION=$(node -p "require('./packages/squad-cli/package.json').version")
    
    echo "⏳ Waiting for npm registry propagation..."
    RETRIES=0
    MAX_RETRIES=5
    DELAY=15
    
    while [ $RETRIES -lt $MAX_RETRIES ]; do
      PUBLISHED_SDK=$(npm view @bradygaster/squad-sdk version 2>/dev/null || echo "")
      PUBLISHED_CLI=$(npm view @bradygaster/squad-cli version 2>/dev/null || echo "")
      
      if [ "$PUBLISHED_SDK" = "$SDK_VERSION" ] && [ "$PUBLISHED_CLI" = "$CLI_VERSION" ]; then
        echo "✅ Verified: SDK $SDK_VERSION and CLI $CLI_VERSION published successfully"
        exit 0
      fi
      
      RETRIES=$((RETRIES + 1))
      echo "⚠️ Versions not yet propagated (attempt $RETRIES/$MAX_RETRIES). Waiting ${DELAY}s..."
      sleep $DELAY
    done
    
    echo "❌ ERROR: Published versions do not match expected versions after $MAX_RETRIES attempts"
    echo "   Expected SDK: $SDK_VERSION, Got: $PUBLISHED_SDK"
    echo "   Expected CLI: $CLI_VERSION, Got: $PUBLISHED_CLI"
    exit 1
```

**Why:** 
- Catches version mangling IMMEDIATELY after publish
- Retries with exponential backoff handle npm registry propagation delay (observed: 15-75 seconds)
- Fails the workflow if verification doesn't pass, alerting the team

### 4. Deprecation instructions for 0.8.2-1.4

**For Brady to run locally (requires npm auth):**

```bash
# Deprecate the mangled version on squad-sdk (squad-cli doesn't have it)
npm deprecate @bradygaster/squad-sdk@0.8.2-1.4 "Invalid version — npm mangled 0.8.21.4 to 0.8.2-1.4. Use 0.8.22 instead."
```

**What this does:**
- Adds a warning message that users see when installing this specific version
- Does NOT remove the version from the registry (npm doesn't allow that)
- Does NOT affect the `latest` tag (already pointing to 0.8.22)
- Provides clear guidance to users who might have cached or pinned this version

**Why not unpublish?**
- npm only allows unpublish within 72 hours AND only if the version has zero downloads
- The mangled version has already been in the registry for hours/days
- Deprecation is the standard npm practice for marking versions as "do not use"

## Impact

- **Pre-publish validation:** Fails CI immediately if someone tries to publish an invalid semver version
- **publishConfig:** Documents publish behavior, prevents accidental misconfiguration
- **Post-publish verification:** Catches mangling immediately, prevents bad versions from going unnoticed
- **Deprecation:** Warns users away from the mangled version without breaking existing installs

## Testing

Test the validation logic with intentionally bad versions:
```bash
# In a test branch, temporarily set version to 0.8.22.3
# Run the validation step
# Expected: fails with clear error message
```

## Alternatives Considered

1. **Version locking in CI:** Lock the version string at tag time (e.g., `git tag v0.8.22` sets version to `0.8.22`). Rejected: requires more complex CI scripting and doesn't prevent local manual publishes.
2. **Pre-commit hooks:** Validate semver in a pre-commit hook. Rejected: doesn't protect against CI misconfigurations or manual publishes.
3. **Manual verification only:** Just check versions manually before publishing. Rejected: humans make mistakes, especially under time pressure.

## Recommendation

✅ **Implement all three safeguards:**
1. Pre-publish validation (prevents bad publishes)
2. publishConfig (documents intent, prevents misconfiguration)
3. Post-publish verification with retry logic (catches issues immediately)

These are complementary layers of defense. The pre-publish check is the primary defense, publishConfig adds explicitness, and post-publish verification is the failsafe.

## Next Steps

1. Brady: Run deprecation command for `0.8.2-1.4` (requires npm auth)
2. Update `squad-publish.yml` workflow with all three safeguards
3. Update `squad-insider-publish.yml` workflow with all three safeguards
4. Add `publishConfig` to both package.json files
5. Test with a dry-run publish (or a test package)
6. Merge this decision to `.squad/decisions.md`

---

**User-first principle:** If users have to think about version mangling, publish is broken.
