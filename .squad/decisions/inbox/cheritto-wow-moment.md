# Decision: First-run wow moment architecture

**Author:** Cheritto (TUI Engineer)
**Date:** 2026-02-26
**Issue:** #341
**PR:** #362

## Context

The first `squad init` and `squad` launch needed to feel magical — the "wow moment" that makes users feel they just assembled an elite team.

## Decision

### Init ceremony (console-based, no Ink dependency)

Chose simple `process.stdout.write` + `setTimeout` typewriter and staggered reveal instead of pulling Ink into the `core/` module. The `core/init.ts` is documented as "zero dependencies" and is used in the bundled `cli.js` standalone — adding React/Ink would break that contract.

Animation parameters: 25ms/char typewriter for opener, 40ms/char for logo, 100ms stagger between landmark lines. These were tuned to feel quick but deliberate — ~500ms total for a 5-item reveal.

### First-launch detection (file marker pattern)

Used a `.squad/.first-run` marker file written by init and consumed (deleted) by the shell on first launch. Alternatives considered:
- **Timestamp comparison** (team.md mtime vs. current time) — fragile across git clone/checkout
- **Config file flag** — adds schema complexity for a one-time event
- **In-memory only** — doesn't survive between `squad init` and `squad` processes

The file marker is atomic, cross-platform, and self-cleaning. The shell deletes it on read, so the guided prompt appears exactly once.

### NO_COLOR respect

All animation gated on `isInitNoColor()` which checks `NO_COLOR`, `TERM=dumb`, and non-TTY. This is consistent with the shell's `isNoColor()` in `terminal.ts` but adds the TTY check since init runs as a standalone process, not inside Ink.

## Alternatives Rejected

- **Ink rendering in init**: Would require React setup for a 2-second ceremony. Overkill.
- **ASCII art banner**: Too flashy, doesn't match the clean Ink aesthetic.
- **Sound/bell**: Unreliable across terminals, often annoying.
