# @bradygaster/squad-sdk

Programmable multi-agent runtime for GitHub Copilot. Resolves squad configuration, loads agent teams, and manages the SDK lifecycle.

## Installation

```bash
npm install @bradygaster/squad-sdk
```

## Quick Example

```typescript
import { resolveSquad, loadConfig } from '@bradygaster/squad-sdk';

// Find the .squad/ directory by walking up from cwd
const squadDir = await resolveSquad();

// Load squad configuration
const config = await loadConfig();

console.log('Loaded team:', config.team.name);
```

## API Overview

| Module | Key Exports | Purpose |
|--------|------------|---------|
| `resolution` | `resolveSquad()`, `resolveGlobalSquadPath()`, `ensureSquadPath()` | Walk-up to find `.squad/` directory; platform-specific global squad path; validate paths stay inside `.squad/` |
| `config` | `loadConfig()`, `loadConfigSync()` | Load and parse squad configuration from disk |
| `agents` | Agent onboarding utilities | Register and initialize agents; manage team discovery |
| `casting` | Casting engine | Universe selection, name allocation, registry management |
| `skills` | Skills system | Load SKILL.md lifecycle, manage confidence levels |
| `coordinator` | `selectResponseTier()`, `getTier()` | Route requests to Direct/Lightweight/Standard/Full tiers |
| `runtime` | Streaming pipeline, cost tracker, telemetry, offline mode | Core async execution, event streaming, i18n support |
| `cli` | `checkForUpdate()`, `performUpgrade()` | SDK version management and update checking |
| `cli` | Output helpers, GitHub utilities | `success()`, `error()`, `warn()`, `info()`, GitHub issue management |
| `marketplace` | Plugin marketplace management | Discover and manage plugins |

## Requirements

- **Node.js:** ≥20
- **TypeScript:** ≥5.0 (for type definitions)
- **Module system:** ESM-only (no CommonJS)

## Links

- **Repository:** [github.com/bradygaster/squad-pr](https://github.com/bradygaster/squad-pr)
- **Issues:** [github.com/bradygaster/squad-pr/issues](https://github.com/bradygaster/squad-pr/issues)
- **Main README:** [github.com/bradygaster/squad-pr#readme](https://github.com/bradygaster/squad-pr#readme)
