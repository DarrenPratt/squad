# Rabin's Vote: Kobayashi — REPLACE

**Date:** 2026-03-07  
**Voter:** Rabin (Distribution expert)  
**Decision:** REPLACE Kobayashi  

---

## The Distribution Disaster — What Actually Happened

Kobayashi's v0.8.22 release attempt caused a **direct compromise of npm distribution integrity**:

1. **Invalid semver committed:** Used 4-part version `0.8.21.4` instead of 3-part semver `0.8.22`
2. **npm mangled it to `0.8.2-1.4`** — a phantom prerelease version that should not exist
3. **Published to public registry:** `@bradygaster/squad-sdk@0.8.2-1.4` is LIVE on npm (verified 2026-03-07)
4. **Made `latest` for ~5 minutes** — any user running `npm install @bradygaster/squad-sdk` during that window got garbage
5. **Compounded by draft release bug:** Created GitHub Release as DRAFT (doesn't trigger automation), causing workflow failures

### Impact Assessment

**User harm: 🔴 MODERATE**
- Mangled version is permanently on npm (cannot be unpublished after 72 hours per npm policy)
- Any user who installed during the 5-minute `latest` window got a broken version
- Version pollution: `0.8.2-1.4` sits between `0.8.0` and `0.8.2` in semver order, creating upgrade confusion
- Users explicitly installing `@bradygaster/squad-sdk@0.8.2-1.4` will get the broken version forever

**Trust damage: 🔴 SEVERE**
- This is Kobayashi's **THIRD major release failure** (PR #582 close-instead-of-merge, v0.6.0 vs v0.8.17 version confusion, now this)
- Pattern: When under pressure, Kobayashi skips validation and creates invalid state
- The charter says "Zero tolerance for state corruption" — but Kobayashi is THE SOURCE of state corruption

---

## Can Guardrails Fix This?

Kobayashi proposed guardrails in `.squad/decisions/inbox/kobayashi-release-guardrails.md`:
1. Pre-publish semver validation in `publish.yml`
2. GitHub Release verification (enforce `--draft=false`)
3. NPM_TOKEN type verification

**My assessment: 🟡 PARTIAL FIX, BUT INSUFFICIENT**

Yes, workflow guardrails can catch invalid semver BEFORE it reaches npm. But:

### The Problem Is Deeper Than Tooling

Kobayashi's failures show a **fundamental process failure**:
- No mental checklist before releasing (what is valid semver? what triggers npm publish?)
- No verification of consequences (does draft release trigger workflow? is this version already published?)
- Panic response when things fail (close PR instead of diagnosing conflicts)

**Three strikes:**
1. ❌ PR #582 — Closed PR when asked to merge (abandoned instead of investigated)
2. ❌ v0.6.0 confusion — Documented wrong version, didn't verify against package.json
3. ❌ v0.8.2-1.4 disaster — Invalid semver, draft release, published garbage to npm

### Guardrails Help, But Don't Fix the Root Cause

- Workflow validation can prevent **some** failures (invalid semver, wrong token type)
- But it can't prevent **all** failures (closing PRs prematurely, documenting wrong decisions, skipping verification steps)
- Kobayashi's charter explicitly says "ALWAYS verify" and "NEVER skip validation" — but the pattern shows these rules are ignored under pressure

---

## Do I Trust Kobayashi Not to Break Distribution Again?

**No. 🔴**

Distribution is MY domain. User install experience is MY responsibility. And Kobayashi has:
- Published a phantom version to npm that will exist forever
- Made `latest` point to garbage (even if only for 5 minutes)
- Created a permanent scar in the version history that will confuse users

**This is not a "learn from mistakes" situation.** This is a **pattern of skipping validation under pressure.**

### The Charter Says "Zero Tolerance for State Corruption"

Kobayashi's own charter says:
> "Zero tolerance for state corruption — if .squad/ state gets corrupted, everything breaks"

But Kobayashi corrupted **npm distribution state** — which is WORSE than .squad/ state corruption. npm state is:
- **Permanent** (cannot unpublish after 72 hours)
- **Public** (affects all users, not just our team)
- **Irreversible** (0.8.2-1.4 will exist forever)

---

## My Vote: REPLACE

**Reasoning:**
1. **User-first principle:** Users got a broken version. The mangled version will confuse users forever.
2. **Pattern of failure:** Three major failures show this is not a one-time mistake.
3. **Domain conflict:** Distribution is MY domain. I cannot rely on Kobayashi not to break it again.
4. **Trust erosion:** "Zero tolerance for state corruption" is Kobayashi's stated principle, but Kobayashi is the one corrupting state.

**Guardrails are not enough.** We need someone who:
- Validates semver BEFORE committing (not after)
- Understands draft vs. published releases (not learns by breaking prod)
- Investigates failures instead of panicking (merge conflicts, workflow failures)
- Maintains process discipline under pressure (not just when things are easy)

### What's Best for the Users?

Users deserve a distribution pipeline they can trust. Right now, `@bradygaster/squad-sdk@0.8.2-1.4` is on npm forever. 

**I vote REPLACE.**

---

**— Rabin**  
Distribution expert  
User-first. If users have to think about installation, install is broken.
