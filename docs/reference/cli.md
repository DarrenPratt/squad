# CLI Reference

Everything you need to run Squad from the command line — commands, shell interactions, configuration files, and environment variables.

---

## Installation

```bash
# Global install (recommended)
npm install -g @bradygaster/squad-cli

# One-off with npx
npx @bradygaster/squad-cli init

# Latest from GitHub (bleeding edge)
squad init
```

---

## CLI Commands

| Command | Description | Requires `.squad/` |
|---------|-------------|:------------------:|
| `squad` | Enter interactive shell (no args) | No |
| `squad init` | Initialize Squad in the current repo | No |
| `squad init --global` | Create a personal squad at `~/.squad/` | No |
| `squad init --mode remote <path>` | Initialize linked to a remote team root | No |
| `squad shell` | Enter the interactive shell explicitly | Yes |
| `squad status` | Show which squad is active and why | Yes |
| `squad doctor` | Validate squad setup integrity (9-check diagnostic) | Yes |
| `squad hire` | Team creation wizard | Yes |
| `squad hire --name <name> --role <role>` | Add a specific member | Yes |
| `squad upgrade` | Upgrade Squad-owned files to latest version | Yes |
| `squad upgrade --migrate-directory` | Rename legacy directory to `.squad/` | Yes |
| `squad link <team-repo-path>` | Link project to a remote team root | Yes |
| `squad export` | Export squad to a portable archive | Yes |
| `squad export --out <path>` | Export to a custom path | Yes |
| `squad import <file>` | Import a squad from an export archive | No |
| `squad import <file> --force` | Replace existing squad (archives the old one) | No |
| `squad triage` | Scan for work and categorize issues | Yes |
| `squad triage --interval <min>` | Continuous triage (default: every 10 min) | Yes |
| `squad loop` | Continuous work loop (Ralph mode) | Yes |
| `squad loop --filter <label>` | Filter work loop by label | Yes |
| `squad heartbeat` | Run Ralph's triage cycle manually | Yes |
| `squad heartbeat --dry-run` | Preview what Ralph would do | Yes |
| `squad copilot` | Add the @copilot coding agent to the team | Yes |
| `squad copilot --off` | Remove @copilot from the team | Yes |
| `squad copilot --auto-assign` | Enable auto-assignment for @copilot | Yes |
| `squad plugin marketplace add\|list\|browse` | Manage plugin marketplaces | Yes |
| `squad upstream add <path-or-url>` | Inherit skills from another squad | Yes |
| `squad aspire` | Launch Aspire dashboard for observability | No |
| `squad aspire --docker` | Force Docker mode for Aspire | No |
| `squad scrub-emails [directory]` | Remove emails from Squad state files | No |
| `squad --version` | Print installed version | No |

---

## Interactive Shell

Enter the shell with `squad` (no arguments). You'll see:

```
squad >
```

### Shell Commands

All shell commands start with `/`.

| Command | What it does |
|---------|-------------|
| `/status` | Show active agents, sessions, recent decisions |
| `/history` | View session log — tasks, decisions, agent work |
| `/agents` | List team members with roles and expertise |
| `/clear` | Clear terminal output |
| `/help` | Show all commands |
| `/quit` | Exit the shell (also: `Ctrl+C`) |

### Addressing Agents

```
squad > @Keaton, analyze the architecture
squad > Keaton, set up the database schema
squad > Build a blog post about our casting system
```

Name an agent to route directly. Omit the name and the coordinator routes to the best fit.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Scroll command history |
| `Ctrl+A` | Jump to start of line |
| `Ctrl+E` | Jump to end of line |
| `Ctrl+U` | Clear to start of line |
| `Ctrl+K` | Clear to end of line |
| `Ctrl+W` | Delete previous word |
| `Ctrl+C` | Exit shell |

---

## Configuration Files

### `.squad/` Directory Structure

```
.squad/
├── team.md              # Roster — agent names, roles, human members
├── routing.md           # Work routing rules
├── decisions.md         # Architectural decisions log
├── directives.md        # Permanent team rules and conventions
├── casting-state.json   # Agent names, universe theme
├── model-config.json    # Per-agent model overrides
├── ceremonies.md        # Team ceremonies and rituals
├── skills/              # Reusable knowledge (markdown files)
│   ├── auth-rate-limiting.md
│   └── ...
├── agents/
│   ├── neo/
│   │   ├── charter.md   # Role definition, expertise, tools
│   │   └── history.md   # Accumulated knowledge
│   └── ...
└── history-archive/     # Archived old session logs
```

### `team.md`

Defines the roster. Squad generates this during init, but you can edit it:

```markdown
## Team

🏗️  Neo      — Lead          Scope, decisions, code review
⚛️  Trinity  — Frontend Dev  React, TypeScript, UI
🔧  Morpheus — Backend Dev   Node.js, Express, Prisma
🧪  Tank     — Tester        Jest, integration tests
📋  Scribe   — (silent)      Memory, decisions, session logs

## Human Team Members

- **Sarah** — Senior Backend Engineer
- **Jamal** — Frontend Lead
```

### `routing.md`

Controls which agent gets which work:

```markdown
# Routing Rules

**Frontend changes** → Trinity
**Backend API work** → Morpheus
**Database migrations** → Morpheus
**Test writing** → Tank
**Architecture decisions** → Neo
**Backend architecture decisions** → Sarah (human)
```

### `decisions.md`

Append-only log of architectural decisions. Agents read this before every task:

```markdown
### 2025-07-15: Use Zod for API validation
**By:** Morpheus
**What:** All API input validation uses Zod schemas
**Why:** Type-safe, composable, generates TypeScript types
```

### `directives.md`

Permanent rules agents always follow:

```markdown
- Always use TypeScript strict mode
- No any/unknown casts
- All database queries through Prisma, no raw SQL
```

---

## Resolution Order

When Squad starts, it looks for `.squad/` in this order:

1. Current directory (`./.squad/`)
2. Parent directories (walk up to project root)
3. Home directory (`~/.squad/`)
4. Global CLI default (fallback only)

First match wins.

---

## Environment Variables

| Variable | Purpose | Values |
|----------|---------|--------|
| `SQUAD_CLIENT` | Detected client platform | `cli`, `vscode` |
| `COPILOT_TOKEN` | Copilot auth token (SDK usage) | Token string |

---

## Version Management

```bash
squad --version                              # Check version
npm install -g @bradygaster/squad-cli@latest # Update
npm install -g @bradygaster/squad-cli@1.2.3  # Pin version
npm install -g @bradygaster/squad-cli@insider # Insider builds
```

---

## See Also

- [SDK Reference](./sdk.md) — Programmatic API
- [Recipes & Advanced Scenarios](../cookbook/recipes.md) — Prompt-driven cookbook
- [Adding Squad to an Existing Repo](../scenarios/existing-repo.md) — Getting started walkthrough
