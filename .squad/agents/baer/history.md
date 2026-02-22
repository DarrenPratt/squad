# Project Context

- **Owner:** Brady
- **Project:** squad-sdk — the programmable multi-agent runtime for GitHub Copilot (v1 replatform)
- **Stack:** TypeScript (strict mode, ESM-only), Node.js ≥20, @github/copilot-sdk, Vitest, esbuild
- **Created:** 2026-02-21

## Learnings

### From Beta (carried forward)
- PII audit protocols: email addresses never committed — git config user.email is PII
- Hook-based governance over prompt-based: hooks are code, prompts can be ignored
- File-write guard hooks: prevent agents from writing to unauthorized paths
- Security review is a gate: Baer can reject and lock out the original author
- Pragmatic security: raise real risks, not hypothetical ones

### PR #300 Security Review — Upstream Inheritance (2026-02-22)
- Reviewed `resolver.ts` and `upstream.ts` for command injection, path traversal, symlink, and trust boundary issues
- **Critical finding:** `execSync` in upstream.ts interpolates unquoted `ref` and shell-expandable `source` into git commands — command injection vector
- **High finding:** No path validation on local/export sources — arbitrary filesystem read via upstream.json

### 📌 Team update (2026-02-22T10:03Z): PR #300 security review completed — BLOCK verdict with 4 critical/high/medium findings — decided by Baer
- **Medium findings:** Symlink following, no user consent model, prompt injection via upstream content
- Upstream content flows directly into agent spawn prompts — governance risk if org-level repo is compromised
- No size limits on file reads from upstream sources
- Tests cover functionality well but have zero security-boundary tests (no traversal, injection, or symlink tests)
