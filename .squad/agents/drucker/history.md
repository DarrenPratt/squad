# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Core Context — Drucker's Focus Areas

**CI/CD Engineer:** Drucker owns GitHub Actions workflows, automated validation gates (semver validation, token verification, draft detection), publish pipeline with retry logic, CI health monitoring, and incident response. Pattern: defense in depth — every workflow has validation gates that assume humans will make mistakes.

## Lessons from Kobayashi's Failures

Drucker was created to replace Kobayashi (along with Trejo) after the v0.8.22 release disaster. These CI-specific lessons are foundational to Drucker's approach:

### 📌 v0.8.22 Release Disaster — CI/CD Perspective

**CI FAILED TO CATCH MISTAKES.** Multiple validation gaps allowed invalid state to reach production.

**What went wrong (CI perspective):**
1. **No semver validation gate:** 4-part version (0.8.21.4) made it through CI to `npm publish`. npm mangled it to 0.8.2-1.4.
2. **No NPM_TOKEN type check:** CI failed 5+ times with EOTP errors before token was replaced. No pre-flight check to verify token type.
3. **No retry logic in verify steps:** npm registry propagation delay (5-30 seconds) caused false 404 failures even when publish succeeded.
4. **Workflow triggered on wrong event:** Release created as draft didn't emit `release: published` event, so workflow never ran automatically.

**Root cause (CI perspective):** Workflows assumed inputs were correct. No defensive validation. No retry logic for external dependencies.

**CI Lessons learned:**
1. **Validation gates are mandatory.** CI must validate semver format before `npm publish`. Use `npx semver {version}` and fail build if invalid.
2. **Verify token type before publishing.** Check NPM_TOKEN is an Automation token (not User token with 2FA). Fail fast with actionable error if wrong type.
3. **Retry logic for external dependencies.** ANY step that depends on npm registry, GitHub API, or other external services needs retry logic with backoff.
4. **Defensive programming.** Assume humans will make mistakes. Assume network will be slow. Assume inputs will be wrong. Catch early with clear errors.
5. **Actionable error messages.** Don't just say "failed" — say "To fix: create an Automation token at..." or "Semver validation failed: use X.Y.Z format".

**What we shipped (CI perspective):**
- Comprehensive release runbook: `.squad/skills/release-process/SKILL.md` includes Common Failure Modes section with CI remediation
- Two new agents: Trejo (Release Manager) owns release decisions, Drucker (CI/CD Engineer) owns workflow automation
- Action items for Drucker: implement semver validation gates, add retry logic to verify steps, document token requirements

**Never again.** CI is our safety net. It failed. We fixed it. We document it so it doesn't happen again.

## CI/CD Technical Context

### GitHub Actions Workflows

Squad uses several workflows:
- **publish.yml** — Publishes SDK and CLI to npm (triggered on `release: published`)
- **squad-release.yml** — Release automation (deprecated/legacy?)
- **squad-ci.yml** — Test suite on PR (all checks must pass)
- **squad-preview.yml** — Preview builds to insiders channel
- **squad-docs.yml** — Documentation deployment

**Key focus:** publish.yml is the most critical. It's the final gate before packages go live on npm.

### npm Registry Propagation Delay

**The 5-30 second problem:**
- After `npm publish` succeeds (exit code 0), the package is written to the registry
- But npm uses a CDN with eventual consistency
- Queries via `npm view` may return 404 for 5-30 seconds (sometimes up to 2 minutes)
- This is NORMAL and EXPECTED behavior
- Verify steps MUST have retry logic to handle this

**Retry pattern:**
```bash
MAX_ATTEMPTS=5
WAIT_SECONDS=15

for attempt in $(seq 1 $MAX_ATTEMPTS); do
  if npm view "$PACKAGE@$VERSION" version > /dev/null 2>&1; then
    echo "✅ Package verified"
    exit 0
  fi
  
  if [ $attempt -lt $MAX_ATTEMPTS ]; then
    echo "⏳ Waiting ${WAIT_SECONDS}s for propagation..."
    sleep $WAIT_SECONDS
  fi
done

echo "❌ Failed to verify after $MAX_ATTEMPTS attempts"
exit 1
```

### NPM_TOKEN Types

**Two token types on npmjs.com:**
1. **User tokens (legacy):** Tied to user account, require 2FA/OTP for publish operations
2. **Automation tokens:** No 2FA required, designed for CI/CD, read-write access

**For CI/CD:**
- MUST use Automation tokens
- User tokens will fail with EOTP error (OTP required but can't be provided interactively in CI)
- Create at: npmjs.com → Settings → Access Tokens → Generate New Token → select "Automation" type
- Store as GitHub secret: `NPM_TOKEN`

**Verification strategy:**
- Check token exists: `[ -z "${{ secrets.NPM_TOKEN }}" ]` fails build if missing
- Document requirement: Workflow comments and README must explain token type requirement
- (Future enhancement: pre-publish check that verifies token type via npm API)

### Semver Validation

**3-part semver (X.Y.Z) or prerelease (X.Y.Z-tag.N) ONLY:**
- 4-part versions (0.8.21.4) are NOT valid semver
- npm parser will mangle them (0.8.21.4 becomes 0.8.2-1.4)
- This breaks `latest` dist-tag and causes customer confusion

**CI validation:**
```bash
VERSION="${{ github.event.release.tag_name }}"
VERSION="${VERSION#v}" # Strip 'v' prefix

if ! npx semver "$VERSION" > /dev/null 2>&1; then
  echo "❌ Invalid semver: $VERSION"
  echo "Only 3-part versions (X.Y.Z) or prerelease (X.Y.Z-tag.N) are valid."
  exit 1
fi

echo "✅ Valid semver: $VERSION"
```

### Draft vs. Published Releases

**GitHub Release states:**
- **Draft:** Not visible to public, doesn't emit `release: published` event
- **Published:** Visible to public, emits `release: published` event (triggers workflows)

**Workflow trigger:**
```yaml
on:
  release:
    types: [published]  # NOT 'created' — only fires for published releases
```

**Problem:** If a release is created as draft, the workflow never triggers automatically.

**Detection (for workflow_dispatch fallback):**
```bash
IS_DRAFT=$(gh api repos/${{ github.repository }}/releases/${{ github.event.release.id }} --jq '.draft')

if [ "$IS_DRAFT" = "true" ]; then
  echo "❌ Release is DRAFT. Workflow requires published release."
  exit 1
fi
```

### SKIP_BUILD_BUMP Environment Variable

**bump-build.mjs behavior:**
- Runs during dev builds to increment build number (0.8.21 → 0.8.21.1 → 0.8.21.2)
- Useful for dev iteration but DISASTROUS during releases (creates 4-part versions)
- Respects `SKIP_BUILD_BUMP=1` env var to disable

**CI requirement:**
```yaml
env:
  SKIP_BUILD_BUMP: "1"

- name: Verify SKIP_BUILD_BUMP is set
  run: |
    if [ "$SKIP_BUILD_BUMP" != "1" ]; then
      echo "❌ SKIP_BUILD_BUMP must be set to 1 for release builds"
      exit 1
    fi
    echo "✅ SKIP_BUILD_BUMP is set"
```

## Learnings

(This section will be populated as Drucker gains experience with CI/CD workflows)
