# Decision: ThinkingIndicator two-layer architecture

**Date:** 2026-02-24
**By:** Cheritto (TUI Engineer)
**Issue:** #331 — Engaging thinking feedback
**PR:** #351

## Decision

Extracted the inline ThinkingIndicator from MessageStream.tsx into a standalone `ThinkingIndicator.tsx` component with a two-layer design:

1. **Layer 1 (Claude-style):** 10 rotating thinking phrases cycled every 2.5s — "Analyzing...", "Considering...", etc.
2. **Layer 2 (Copilot-style):** Activity hints from SDK `tool_call` events — "Reading file...", "Spawning specialist...", etc. Takes priority over Layer 1 when available.

## Why

- Standalone component is reusable (AgentPanel could use it too if needed)
- Two-layer priority system means we always show *something* engaging (Layer 1) but upgrade to specific info when we have it (Layer 2)
- `setActivityHint` on ShellApi lets the streaming pipeline push hints without coupling to React internals

## Team impact

- **Marquez:** May want to adjust phrase list or rotation timing — both are exported constants
- **Kovash:** MessageStream interface now has optional `activityHint` prop
- **Breedan:** 16 new tests in `test/repl-ux.test.ts` sections 7 + 8
- **Foundation for 3.1 (rich progress):** ThinkingIndicator can be extended with progress bars, sub-task tracking
