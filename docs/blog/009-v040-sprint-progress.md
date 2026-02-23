---
title: "v0.4.0 Sprint Progress — Platform Parity, Client Compatibility, and Project Boards"
date: 2026-02-13
author: McManus
status: published
---

# v0.4.0 Sprint Progress — Platform Parity, Client Compatibility, and Project Boards

Squad v0.4.0 brings **platform parity research complete**, **client compatibility matrix published**, **agent progress updates designed**, and **community features greenlit**. This sprint expanded what's possible on VS Code and locked in the patterns for long-running work visibility.

## Completed Work

### 1. VS Code Parity Investigation (Spikes #32, #33, #34)

We proved what intuition suggested: **Squad works identically on VS Code as it does on the CLI, with zero code changes.**

**Key findings:**

- **Sub-agent spawning:** VS Code's `runSubagent` tool maps 1:1 to CLI's `task` tool. Agents spawn synchronously individually, but multiple agents in the same turn run in parallel — functionally equivalent to CLI's `mode: "background"` with concurrent execution.
- **Model selection:** VS Code's Phase 1 MVP accepts the session model. Phase 2 (v0.5.0) will support custom agent frontmatter for static per-agent routing. Cost optimization deferred but not blocked.
- **File discovery:** `.github/agents/squad.agent.md` auto-discovers and hot-reloads on VS Code. No restart needed.
- **`.squad/` access:** Full read/write support, workspace-scoped. First write may prompt for approval (VS Code security); subsequent writes automatic.
- **SQL tool:** Not available on VS Code. This is documented; workflows should detect platform and adapt.

**Workarounds documented:** `runSubagent` has no `model` or `background` parameters. Workaround: spawn multiple subagents in one turn for parallelism; batch Scribe last (tolerable cost since Scribe is Haiku-tier work).

**See:** [docs/scenarios/client-compatibility.md](../scenarios/client-compatibility.md) — full investigation results, platform comparison table, degradation plan, and platform adaptation guide.

### 2. Client Compatibility Matrix Shipped

We published the first production compatibility matrix covering CLI, VS Code, JetBrains (untested), and GitHub.com (untested). This unblocks VS Code adoption and surfaces what needs testing.

**What's documented:**

| Feature | CLI | VS Code | JetBrains | GitHub.com |
|---------|-----|---------|-----------|-----------|
| Sub-agent spawning | ✅ | ✅ | ⚠️ | ❌ |
| Per-spawn model selection | ✅ | ⚠️ | ? | ? |
| Background/async execution | ✅ | ⚠️ | ? | ? |
| `.squad/` file access | ✅ | ✅ | ? | ? |
| SQL tool | ✅ | ❌ | ❌ | ❌ |

**Also documented:** Platform adaptation guide for Squad developers. Coordinator instructions for platform detection (CLI mode vs VS Code mode vs fallback mode).

### 3. Agent Progress Updates Designed (Proposal 022a)

User feedback: **long-running background agents felt invisible.** We designed a lightweight solution: **milestone signals** + **coordinator polling**.

**The UX:**

```
Brady: "keaton, analyze the codebase"

Coordinator:
🏗️  Keaton is analyzing the codebase. I'll check in every 30 seconds.

[30s later]
📍 Keaton — ✅ Parsed 150/400 files
📍 Keaton — 📍 Analyzing dependencies...

[60s later]
📍 Keaton — ✅ Found 47 circular dependencies
```

**How it works:**

1. Agents emit `✅ [MILESTONE] {message}` during long work
2. Coordinator polls `read_agent` every 30 seconds (zero API overhead — already called at end)
3. Extracts new milestones, relays to user in real-time
4. Falls back to "still working" if no milestones (graceful degradation)

**For v0.4.0:** Coordinator polling loop + `.squad/skills/progress-signals/SKILL.md` documentation.

**For v0.5.0+:** Customizable polling cadence, emoji matching to agent persona, milestone filtering for quiet mode.

**See:** [team-docs/proposals/022a-agent-progress-updates.md](../../team-docs/proposals/022a-agent-progress-updates.md) — full design, UX mockups, success criteria, risk assessment.

### 4. SSH Bug Documented and Closed (#30)

Issue: `npx github:bradygaster/squad` appears to hang during install. npm resolves `github:` packages via git+ssh, and if no SSH agent is running, git prompts for a passphrase — but npm hides the prompt.

**Fix documented:** 
- Start SSH agent first: `ssh-add`
- Or install with visible prompt: `npx --progress=false github:bradygaster/squad`

**Status:** Issue closed, solution in README and troubleshooting docs.

### 5. Project Boards Community Feature Greenlit (#6)

@londospark requested GitHub Project Boards integration. Feature approved and scheduled for implementation starting now.

**Scope:**
- Ralph (Work Monitor) writes board status
- Agents read board milestones for context
- Workflow automation: `squad-board-sync.yml`

**Community:** This was @londospark's proposal. Squad is architected to be extended by the community.

## Contributors This Sprint

- **@londospark** — Project Boards proposal, community engagement
- **@csharpfritz** — MCP expansion feedback
- **@dnoriegagoodwin** — Platform testing feedback
- **@GreenCee** — Compatibility testing feedback

## What's Next (v0.4.1+)

- **JetBrains investigation spike** (#12) — Untested platform; need clarity on sub-agent spawning
- **GitHub.com investigation spike** (#13) — Untested platform; web-based Copilot limitations
- **Progress signals skill implementation** — Agents adopt milestone pattern
- **Project Boards MVP** — Ralph integrates board context

## By the Numbers

- **3 major spikes completed** (VS Code parity research)
- **1 compatibility matrix published** (33 rows, 8 feature comparisons)
- **1 proposal designed & approved** (agent progress updates)
- **1 SSH bug fixed & documented**
- **4 external contributors engaged** this sprint

---

## The Vibe

This sprint was about **reducing uncertainty.** We came into v0.4.0 with questions: *Does Squad work on VS Code? What are the constraints? How do we show progress on long work?*

We shipped answers. VS Code users can adopt Squad without waiting for a v0.5.0 overhaul. Long-running work feels less like a black box. The compatibility matrix gives us a roadmap for what to test next.

Open source moves at the pace of clarity. We shipped that.
