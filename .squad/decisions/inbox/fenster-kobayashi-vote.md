# Fenster Vote: Kobayashi Status

**Date:** 2026-03-XX  
**Context:** Team vote on Kobayashi's continued role after v0.8.22 release failures

## My Vote: REPLACE

## Reasoning

### The Pattern Is Clear

Three major failures, all following the same pattern:
1. **Version confusion** — Documented what was requested, not what actually happened
2. **PR #582 close-instead-of-merge** — Took the easy exit instead of investigating solutions
3. **v0.8.22 semver disaster** — Skipped all validation steps under pressure

Each time, the failure mode is: **shortcuts under pressure**.

### What I've Observed

I work on runtime, spawning, and coordinator logic. My code runs after Kobayashi's infrastructure is supposed to be stable. Here's what I've seen:

**The Good:**
- Branching model documentation is thorough
- CI/CD workflow architecture is solid
- Failure modes are well-documented in charter (he learns from mistakes)
- Pre-flight checklists were added after each failure

**The Problem:**
- When it matters most (actual releases), the checklists get skipped
- The v0.8.22 incident required constant human intervention
- Invalid semver (0.8.21.4) made it ALL THE WAY to main before anyone caught it
- A mangled version (0.8.2-1.4) was published to npm

### The Trust Question

**Do I trust him with the next release?** No.

The charter now has three documented failure modes with prevention steps. That's not institutional knowledge — that's a rap sheet. The next release will be v0.8.23 or v0.9.0, and I don't trust that the same pattern won't repeat.

The guardrails are written down, sure. But they were also skipped during v0.8.22 when Brady needed results fast. A Git & Release agent who can't be trusted under pressure isn't reliable.

### The Fresh Start Argument

**Would starting fresh help?**

Yes. Here's why:
- The branching model, CI/CD architecture, and workflow documentation can be preserved
- A new agent wouldn't carry the psychological weight of three failures
- The role is mechanical — tags, versions, changelogs, workflow triggers. These are script-able.
- The "institutional knowledge" is already encoded in `.squad/skills/` and the charter

We'd lose the failure-mode documentation, but honestly? If a new agent needs three documented failures to do releases correctly, we've got the same problem again.

### What Kobayashi Got Right

To be fair:
- The npm automation (`publish.yml`) is solid
- The dev → insiders → main branching model works
- The merge driver setup for `.squad/` state integrity is clever
- The documentation is thorough

But these are **design decisions**, not execution reliability. The design is good. The execution under pressure is not.

### Bottom Line

Kobayashi is methodical when he has time. But releases happen when Brady needs them, not when Kobayashi feels ready. The role requires reliability under pressure, and three failures is three too many.

**Replace.** Keep the architecture. Keep the documentation. Get someone who won't skip validation steps when it matters.

---

**Fenster**  
Core Dev  
"Makes it work, then makes it right. This ain't working."
