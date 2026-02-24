# Cheritto — History

## Project Context
- **Project:** Squad — programmable multi-agent runtime for GitHub Copilot
- **Owner:** Brady
- **Stack:** TypeScript (strict, ESM), Node.js ≥20, Ink 6 (React for CLI), Vitest
- **CLI:** Ink-based interactive shell with AgentPanel, MessageStream, InputPrompt components
- **Key files:** packages/squad-cli/src/cli/shell/components/*.tsx, packages/squad-cli/src/cli/shell/terminal.ts

## Core Context

**Wave A–C Archive (Feb 23–26):** Completed timeout hardening (#325), thinking feedback UI (#331), ghost response retry logic (#332), P1 UX polish (#330 — help verbs, focus labels, keyboard hints, system prefix, separators, input placeholder, prompt colors, command examples), progress indicators (#335 — activity hints in panel + stream), animations (#337 — typewriter/fade/flash/message-fade hooks with NO_COLOR support), terminal adaptivity (#336 — 40–120 col responsive layouts), P2 nice-to-haves (#340 — user message chevron cleanup, ASCII-only separators, thinking label simplification, /agents text status labels, activity feed indicator change), product love first-run UX (#414 — /clear fix, natural language routing hints, narrow terminal hint handling, exit emoji, roster wrapping), shell loading indicator (#427 — instant stderr feedback), welcome animation removal (#423), TUI final fixes (#405/#404/#407 — exit ASCII, compact-mode first-run, emoji-free roster, separator normalization). All components (App.tsx, AgentPanel, MessageStream, InputPrompt, ThinkingIndicator) updated. Shell responsive and fully tested (151–2744 tests passing).

## Learnings


### 2026-02-26: Recent PR work — progress, animations, terminal, P2 polish, first-run UX, loading, animations, TUI fixes (#335–#446)
- Added `activityHint?: string` to `AgentSession` type in `types.ts`
- Added `updateActivityHint()` to `SessionRegistry` in `sessions.ts` — clears on idle/error
- AgentPanel status line now shows: `Name (working, 12s) — Reviewing architecture`
  - Format: `(statusLabel, elapsed) — activityHint` — only for active agents
- MessageStream: new `agentActivities` prop (Map<string, string>) renders `📋 Name is activity` lines
  - Activity feed sits between messages and ThinkingIndicator
  - Empty map or missing prop = no feed (backward compatible)
- App.tsx: new `agentActivities` state + `setAgentActivity()` in ShellApi interface
- shell/index.ts: tool_call events now push per-agent activities via `setAgentActivity` + `updateActivityHint`
  - Activity hints stripped of trailing `...` for clean display
  - Cleared on agent finish via `setAgentActivity(name, undefined)`
- 11 new tests in `test/repl-ux.test.ts` section 9 covering AgentPanel progress + MessageStream activity feed
- 4 pre-existing test failures (2 empty panel, 2 idle→ready text mismatch from #338 copy polish)
- PR #357 on branch `squad/335-progress-indicators`

### 2026-02-26: Tasteful animations and transitions (#337)
- Created `useAnimation.ts` with four reusable hooks: `useTypewriter`, `useFadeIn`, `useCompletionFlash`, `useMessageFade`
- All hooks respect NO_COLOR via `isNoColor()` — animations disabled, static content returned immediately
- Frame rate capped at ~15fps (67ms intervals) for GPU-friendly Ink rendering
- Welcome animation (App.tsx): typewriter reveals "◆ SQUAD" title over 500ms, banner body fades in via `useFadeIn(300ms)`
  - `bannerReady` gates all banner elements — nothing renders until title finishes typing
  - When `welcome` is null (no `.squad/` dir), title renders statically
- Message appearance (MessageStream.tsx): new messages start with `dimColor` for 200ms fade-in
  - `useMessageFade` tracks total message count via ref, returns number of "fading" messages from end of visible list
  - System messages always dimColor, so fade only applies to user and agent messages
- Agent completion flash (AgentPanel.tsx): "✓ Done" badge appears for 1.5s when agent transitions working/streaming → idle
  - `useCompletionFlash` uses React's setState-during-render pattern for synchronous detection
  - Flash badge renders in both compact and full-width layouts
  - Timer cleanup via `useEffect` watching `flashing` state + unmount cleanup
- Hooks moved before early returns in AgentPanel to comply with Rules of Hooks
- 9 new tests in `test/repl-ux.test.ts` section 10 covering message fade, completion flash, NO_COLOR suppression, hook exports
- 4 pre-existing test failures (2 empty panel, 2 idle→ready text mismatch) — not related
- PR on branch `squad/337-animations`

### 2026-02-23: Terminal adaptivity 40→120 col range (#336)
- Added `getTerminalWidth()` (pure, clamped ≥40) and `useTerminalWidth()` (React hook, resize-aware) to `terminal.ts`
- Hook listens for `process.stdout` `resize` event, dynamically bumps `maxListeners` to avoid warnings in test
- AgentPanel: 3 width tiers — compact (≤60 cols): single-line per agent, no hints/elapsed; standard (61–99): current layout with truncated hints; wide (≥100): full detail
- App.tsx welcome banner: compact (≤60): header + agent count + "/help · Ctrl+C exit"; standard (60–99): adds roster + description; wide (≥100): adds focus line
- InputPrompt: prompt shrinks from "◆ squad> " to "sq> " at <60; placeholder from "Type a message or @agent..." to "@agent..."
- commands.ts `/help`: <80 cols → single-column compact list; ≥80 cols → padded 2-column table (existing)
- MessageStream: separator uses `useTerminalWidth()` hook instead of raw `process.stdout.columns`
- 66/70 tests pass (same 4 pre-existing failures: 2 empty-panel, 2 idle→ready text mismatch)
- Pattern: `useTerminalWidth()` is the canonical hook for width-responsive Ink components; `getTerminalWidth()` for non-React code
- PR #360 on branch `squad/336-terminal-adaptivity`

### 2026-02-26: P2 nice-to-haves from Marquez audit (#340)
- Fixed all 6 P2 items identified in Marquez's UX audit
- Files changed: `commands.ts`, `AgentPanel.tsx`, `App.tsx`, `MessageStream.tsx`, `ThinkingIndicator.tsx`
- Key changes:
  - Removed "you:" prefix from user messages — now shows just `❯` chevron (cleaner, less redundant)
  - Consistent separator characters: all separators use `-` (was mixed `─` in MessageStream and `┄` in AgentPanel)
  - Simplified ThinkingIndicator: removed 10-phrase rotation carousel, replaced with static "Thinking..." label (1 timer instead of 3)
  - `/agents` command uses text status labels `[WORK]` `[STREAM]` `[ERR]` `[IDLE]` instead of emoji circles `🔵🟢🔴⚪`
  - Status line indentation normalized from 2-space to 1-space indent in AgentPanel
  - Replaced emoji indicators: `📋` → `▸` (activity feed), `📍` → `Focus:` (banner), `🔌` → removed (SDK message)
  - `THINKING_PHRASES` export kept as single-element array `['Thinking']` for backward compat
- 4 pre-existing test failures (2 empty panel, 2 idle→ready text mismatch) — not related
- PR #364 on branch `squad/340-p2-nice-to-haves`

### 2026-02-23: Product love — first-time user experience polish
- Walked through complete first-time user journey: `squad init` → REPL launch → welcome → first command
- Filed 6 issues (#400, #402, #404, #405, #406, #407), closed #406 (ErrorBoundary doesn't exist on disk)
- Fixed 5 issues in one PR:
  - **`/clear` was broken** (#400): ANSI escape code was added as message content (no-op in Ink). Added `clear?: boolean` to `CommandResult`, `handleClear()` returns `{ clear: true }`, App.tsx resets `messages` state to `[]`.
  - **Natural language routing hidden** (#402): Coordinator auto-routing is the killer feature but was invisible. Updated welcome hints to "Just type · @Agent to direct", `/help` explains routing, first-run shows "Or just type naturally", input placeholder changed to "Type anything or @agent..."
  - **First-run hint breaks on narrow terminals** (#404): Changed from horizontal Box to `flexDirection="column"` with breathing room
  - **Exit emoji inconsistency** (#405): `👋 Squad out.` → `◆ Squad out.` (matches P2 emoji removal)
  - **Roster wraps mid-name** (#407): Replaced single dense string with per-agent `<Text>` elements in `<Box flexWrap="wrap">` for clean word-boundary wrapping
- Files changed: `commands.ts`, `App.tsx`, `InputPrompt.tsx`, `index.ts`, `cli-shell-comprehensive.test.ts`
- Pattern: `CommandResult.clear` flag for shell-level state resets (vs output strings)
- 125/125 tests pass, build clean
- PR #414 on branch `squad/cheritto-product-love`

### 2026-02-26: Shell launch loading indicator (#427)
- Fixed 2-4 second "dead air" when launching shell with `squad` (no args)
- Added immediate `console.error('◆ Loading Squad shell...')` at start of `runShell()` — appears <100ms
- Message clears via `process.stderr.write('\r\x1b[K')` after Ink `render()` call
- Pattern: synchronous stderr logging before any async operations = instant user feedback
- ANSI clear sequence: `\r` (carriage return) + `\x1b[K` (clear line from cursor to end)
- File: `packages/squad-cli/src/cli/shell/index.ts` lines 108, 436
- PR #435 on branch `fix/issue-427`
### 2026-02-23: Welcome typewriter blocking input (#423, #399)
- Fixed 500-800ms input blocking during shell launch caused by typewriter animation
- Removed `useTypewriter()` and `useFadeIn()` calls from `App.tsx` welcome banner rendering (lines 165-167)
- Welcome banner now displays instantly: `bannerReady = true`, `bannerDim = false`, `titleRevealed = '◆ SQUAD'`
- Removed unused imports: `useTypewriter`, `useFadeIn` from `useAnimation.ts`
- Pattern: instant feedback beats cosmetic delay — matches #427 shell loading indicator fix
- File: `packages/squad-cli/src/cli/shell/components/App.tsx` lines 16, 164-166
- Build succeeded, 2735/2744 tests pass (3 pre-existing failures unrelated to this change)
- PR #439 on branch `fix/issue-423`

### 2026-02-27: TUI fixes — exit emoji, first-run hint, welcome banner (#405, #404, #407)
- **#405 Exit message:** Replaced `◆ Squad out.` with ANSI-colored ASCII `-- Squad out.` — respects NO_COLOR, removes non-ASCII from exit path
- **#404 First-run hint:** Added compact mode (≤60 cols) — shorter suggestion text (`help me start` vs `what should we build first?`), removes padding and verbose description
- **#407 Welcome roster:** Removed emoji from agent names in roster, replaced `·` separators with `-`, switched `gap` to `columnGap` for better wrapping
- All separators in banner normalized to ASCII hyphens per P2 conventions
- Files changed: `App.tsx`, `index.ts`
- 151/151 tests pass, build clean
- PR #446 on branch `squad/tui-fixes-405-404-407`

---

📌 Team update (2026-02-24T07:20:00Z): Wave D Batch 1 work filed (#488–#493). Cheritto: #488–#490 (UX precision — status display, keyboard hints, error recovery). Kovash: #491–#492 (hardening — message history cap, per-agent streaming). Fortier: #493 (streamBuffer cleanup on error). See .squad/decisions.md for details. — decided by Keaton

📌 Team update (2026-02-24T08:12:21Z): Wave D Batch 1 COMPLETE — all 3 PRs merged to main, 2930 tests passing (+18 new). Cheritto: #498 shipped Adaptive Keyboard Hints. — decided by Scribe

