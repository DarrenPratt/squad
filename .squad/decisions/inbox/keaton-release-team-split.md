# Release Team Split — Kobayashi → Trejo + Drucker

**Date:** 2026-03-07  
**Decided by:** Keaton (Lead), requested by bradygaster  
**Context:** v0.8.22 release disaster retrospective

## Decision

Retire Kobayashi (Git & Release). Replace with TWO specialized agents with clear separation of concerns:

1. **Trejo — Release Manager**
   - Role: End-to-end release orchestration, version management, GitHub Releases, changelogs
   - Model: claude-haiku-4.5 (mechanical operations, checklist-driven)
   - Domain: Release decisions (when, what version, rollback authority)
   - Boundaries: Does NOT own CI/CD workflow code (that's Drucker's domain)

2. **Drucker — CI/CD Engineer**
   - Role: GitHub Actions workflows, automated validation gates, publish pipeline, CI health
   - Model: claude-sonnet-4.6 (workflow code requires reasoning about edge cases)
   - Domain: CI/CD automation (workflow code, validation gates, retry logic)
   - Boundaries: Does NOT own release decisions (that's Trejo's domain)

## Why

**Root cause of v0.8.22 disaster:** Single agent (Kobayashi) owned both release decisions AND CI/CD workflows. When under pressure, improvised and skipped validation. Result: 4-part semver mangled by npm, draft release never triggered automation, wrong NPM_TOKEN type, 6+ hours of broken `latest` dist-tag.

**Separation of concerns prevents single point of failure:**
- Trejo owns the WHAT and WHEN (release orchestration, version numbers, timing)
- Drucker owns the HOW (automation, validation gates, retry logic)
- Neither agent can cause a disaster alone — Drucker's gates catch Trejo's mistakes, Trejo's process discipline catches Drucker's workflow bugs
- Clear boundaries reduce confusion during incidents

**Hard lessons baked into charters:**
- Trejo: ALWAYS validate semver before commit, NEVER create draft releases when automation depends on published, verify NPM_TOKEN type before first publish
- Drucker: Every publish workflow MUST have semver validation gate, verify steps MUST have retry logic, token type verification before publish

## Charters Created

- `.squad/agents/trejo/charter.md` — Release Manager charter with Known Pitfalls section (Kobayashi's failures)
- `.squad/agents/trejo/history.md` — Seeded with project context and v0.8.22 disaster lessons
- `.squad/agents/drucker/charter.md` — CI/CD Engineer charter with Technical Patterns section (retry logic, semver validation, token checks)
- `.squad/agents/drucker/history.md` — Seeded with CI/CD context and npm propagation delay lessons

## Kobayashi Status

Moved to `.squad/agents/_alumni/kobayashi/` (already done). Charter preserved as learning artifact.

## Impact

- Future releases require coordination between Trejo (orchestration) and Drucker (automation)
- Release failures are less likely (validation gates) and easier to diagnose (clear ownership)
- Both agents have explicit "Known Pitfalls" sections documenting Kobayashi's failures
- Release process skill (`.squad/skills/release-process/SKILL.md`) remains the definitive runbook

## Next Steps

1. ✅ Charters created for Trejo and Drucker
2. ⏳ Update `.squad/team.md` to reflect roster change (Scribe's task)
3. ⏳ Update `.squad/routing.md` to route release issues to Trejo, CI/CD issues to Drucker (Scribe's task)
4. ⏳ Drucker: implement semver validation gates in publish.yml
5. ⏳ Drucker: add retry logic to verify steps (if not already present)
6. ⏳ Drucker: add NPM_TOKEN type verification step

---

**Never again.** Separation of concerns ensures no single agent can cause a release disaster.
