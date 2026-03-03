# Migration Checklist: origin (squad-pr) → beta (squad) — npm 0.8.18 / public v0.8.17

**⚠️ BANANA RULE IS ACTIVE.** Do NOT execute ANY steps until Brady says "banana".

---

## BANANA GATE
- [ ] **Brady explicitly said: "banana"**

If NOT checked, STOP. Do not proceed.

---

## Phase 1: Prerequisites
- [ ] Both repos accessible: `origin` remote (bradygaster/squad-pr), `beta` remote (bradygaster/squad)
- [ ] Working directory: `C:\src\squad-pr`
- [ ] Clean tree: `git status` shows no uncommitted changes
- [ ] Node.js ≥20: `node --version`
- [ ] npm ≥10: `npm --version`

---

## Phase 2: Tag v0.8.17 on Origin

**Note:** Public repo (bradygaster/squad) is at v0.5.4. v0.8.17 is the target version for the public release. The v0.8.17 tag will be created at the migration merge commit on the public repo (not retroactively on origin).

---

## Phase 3: Push origin/migration to beta/migration
- [ ] Verify migration branch HEAD: `git rev-parse migration` → `87e4f1c`
- [ ] Ensure beta remote exists: `git remote -v | grep beta`
- [ ] If missing: `git remote add beta https://github.com/bradygaster/squad.git`
- [ ] Fetch beta: `git fetch beta`
- [ ] Push migration branch to beta: `git push beta migration:migration`
- [ ] Verify on beta: `gh repo view bradygaster/squad --branch migration`

---

## Phase 4: Merge beta/migration → beta/main
- [ ] Navigate to beta repo (or switch remote context)
- [ ] Create PR: `gh pr create --repo bradygaster/squad --base main --head migration --title "Migration: squad-pr → squad" --body "..."`
- [ ] PR body should include:
  - [ ] Version jump: v0.5.4 → v0.8.17
  - [ ] Breaking changes (monorepo, npm distribution, .squad/ vs .ai-team/)
  - [ ] User upgrade path (GitHub-native → npm)
  - [ ] Distribution change (npx github: → npm install -g)
- [ ] Wait for CI checks (if any)
- [ ] Merge PR to beta/main
- [ ] Verify merge: `git fetch beta && git log beta/main -5`

---

## Phase 5: Version Alignment on Beta
**IMPORTANT CLARIFICATION:** Same version everywhere — npm packages and public repo are both 0.8.17:
- **npm packages** (`@bradygaster/squad-cli`, `@bradygaster/squad-sdk`): 0.8.17 (released)
- **Public repo tag** (`bradygaster/squad`): The v0.8.17 GitHub Release tag marks this migration commit.

- [ ] **Do NOT** change npm package.json versions — they are already at 0.8.17
- [ ] Create **v0.8.17 tag at migration merge commit** on beta/main (public repo marker, same as npm version)
- [ ] Document as "Migration release: GitHub-native → npm distribution, monorepo structure"
- [ ] Rationale: Beta's public version jump (0.5.4 → 0.8.17) aligns with npm packages already at 0.8.17

---

## Phase 6: Package Name Reconciliation
**Problem:** Beta uses `@bradygaster/create-squad`. Origin uses `@bradygaster/squad-cli` + `@bradygaster/squad-sdk`.

### Option A: Deprecate `@bradygaster/create-squad`
- [ ] Publish final version of `@bradygaster/create-squad` with deprecation notice
- [ ] Update npm metadata: `npm deprecate @bradygaster/create-squad "Migrated to @bradygaster/squad-cli"`
- [ ] All future releases under `@bradygaster/squad-cli` + `@bradygaster/squad-sdk`

### Option B: Rename packages back to `@bradygaster/create-squad`
- [ ] Update all package.json `name` fields in origin
- [ ] Not recommended (origin's naming is more accurate: CLI vs SDK)

**Recommendation: Option A.** Deprecate old package, move forward with new names.

---

## Phase 7: Beta User Upgrade Path

**For users on v0.5.4 (GitHub-native distribution):**

1. **Uninstall old distribution (if globally installed):**
   - [ ] N/A (GitHub-native doesn't install globally)

2. **Switch to npm distribution:**
   - [ ] `npm install -g @bradygaster/squad-cli@latest`
   - [ ] Or: `npx @bradygaster/squad-cli`

3. **Migrate `.ai-team/` to `.squad/`:**
   - [ ] Squad v0.8.17 uses `.squad/` directory (not `.ai-team/`)
   - [ ] User must manually rename: `mv .ai-team .squad` (if project has one)
   - [ ] ⚠️ Format may be incompatible — see migration guide

4. **Update CI/CD scripts:**
   - [ ] Replace `npx github:bradygaster/squad` with `npx @bradygaster/squad-cli`
   - [ ] Update version pinning strategy (npm tags instead of git SHAs)

5. **Test new version:**
   - [ ] `squad --version` → v0.8.17
   - [ ] `squad doctor` (if available)

---

## Phase 8: npm Publish (Origin Packages)
- [ ] Verify npm credentials: `npm whoami`
- [ ] Build packages: `npm run build` (exit code 0)
- [ ] Test packages: `npm test` (all pass)
- [ ] Publish SDK: `npm publish -w packages/squad-sdk --access public` (publishes 0.8.18 from current package.json)
- [ ] Publish CLI: `npm publish -w packages/squad-cli --access public` (publishes 0.8.18 from current package.json)
- [ ] Verify on npm: `npm view @bradygaster/squad-cli@0.8.18`
- [ ] Verify on npm: `npm view @bradygaster/squad-sdk@0.8.18`

---

## Phase 9: GitHub Release (Beta Repo)
- [ ] Fetch latest beta/main: `git fetch beta && git log beta/main -1`
- [ ] Tag beta at merge commit: `git tag v0.8.17 <merge-commit-sha>` (public repo release marker, matches npm version)
- [ ] Push tag: `git push beta v0.8.17`
- [ ] Create GitHub Release: `gh release create v0.8.17 --repo bradygaster/squad --title "v0.8.17 — Migration: GitHub-native → npm Distribution"`
- [ ] Release body includes:
  - [ ] **Breaking Changes:** GitHub-native → npm, `.ai-team/` → `.squad/`, monorepo structure
  - [ ] **New Distribution:** `npm install -g @bradygaster/squad-cli` or `npx @bradygaster/squad-cli`
  - [ ] **Upgrade Guide:** Link to migration docs
  - [ ] **Version Jump:** v0.5.4 → v0.8.17 (intermediate versions skipped)
- [ ] Mark as "Latest" release (not prerelease)

---

## Phase 10: Deprecate Beta's Old Package (if applicable)
- [ ] If `@bradygaster/create-squad` was published to npm:
  - [ ] `npm deprecate @bradygaster/create-squad "Migrated to @bradygaster/squad-cli. Install with: npm install -g @bradygaster/squad-cli"`
- [ ] Verify deprecation: `npm view @bradygaster/create-squad`

---

## Phase 11: Post-Release Bump (Origin)
**Per release versioning sequence:** After publishing v0.8.17, immediately bump to v0.8.18-preview.1 for continued development.

- [ ] Already done: commit `87e4f1c` bumped to `0.8.18-preview`
- [ ] Verify: `git show 87e4f1c:package.json | grep version` → `0.8.18-preview`
- [ ] Note: Should be `0.8.18-preview.1` per new semver format (fix if needed)

---

## Phase 12: Update Migration Docs
- [ ] Update `docs/migration-github-to-npm.md` with v0.8.17 specifics
- [ ] Update `docs/migration-guide-private-to-public.md` with actual version numbers
- [ ] Link to this checklist from main migration guide
- [ ] Commit: "docs: update migration guides for v0.8.17 execution"

---

## Phase 13: Verification
- [ ] Origin packages on npm: `npm view @bradygaster/squad-cli@0.8.17` ✅
- [ ] Origin packages on npm: `npm view @bradygaster/squad-sdk@0.8.17` ✅
- [ ] Beta release on GitHub: `gh release view v0.8.17 --repo bradygaster/squad` ✅
- [ ] Beta main branch HEAD includes migration: `git log beta/main --oneline -5` shows merge ✅
- [ ] Test install: `npm install -g @bradygaster/squad-cli@0.8.17 && squad --version` → 0.8.17 ✅

---

## Phase 14: Communication & Closure
- [ ] Announce migration completion in team channels (if any)
- [ ] Update beta repo README with new installation instructions
- [ ] Add migration notes to beta repo's CHANGELOG.md
- [ ] Document decision: `.squad/decisions/inbox/kobayashi-migration-complete.md`
- [ ] Update Kobayashi history: `.squad/agents/kobayashi/history.md`

---

## Rollback Plans

### If migration to beta fails:
- [ ] Delete beta/migration branch: `git push beta :migration`
- [ ] Close PR without merging
- [ ] Origin remains unaffected (no changes pushed)

### If npm publish fails:
- [ ] Unpublish within 72 hours (npm policy): `npm unpublish @bradygaster/squad-cli@0.8.17`
- [ ] Fix issue, re-publish with patch version (v0.8.18)

### If beta users report critical issues:
- [ ] Publish hotfix as v0.8.18 with fix
- [ ] Update GitHub Release notes with workaround
- [ ] Consider yanking v0.8.17 from npm (use `npm deprecate` instead of unpublish)

---

## Final Checklist
- [ ] **v0.8.17 tag exists on beta** (public repo migration marker at merge commit)
- [ ] **origin/migration pushed to beta/migration**
- [ ] **beta/migration merged to beta/main**
- [ ] **Both npm packages published: squad-cli@0.8.17, squad-sdk@0.8.17**
- [ ] **GitHub Release v0.8.17 created on beta repo** (public release marker)
- [ ] **Beta users have upgrade path documented** (npm 0.8.17 installation)
- [ ] **Origin bumped to 0.8.18-preview.1 for continued development** (next dev version)
- [ ] **All docs updated with correct versioning (npm 0.8.17 everywhere)**

---

**Execution Date:** _______________  
**Executed By:** _______________  
**Status:** ✅ COMPLETE / 🛑 FAILED / ⏸️ PAUSED  
**Notes:** _______________________________________________________________

---

**Document maintained by:** Kobayashi (Git & Release)
