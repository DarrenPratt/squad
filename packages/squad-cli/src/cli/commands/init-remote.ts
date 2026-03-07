/**
 * squad init --mode remote — remote mode variant of the init command.
 *
 * Creates .squad/ with config.json pointing to an external team root.
 * The standard init scaffolding still runs; this just adds the config link.
 *
 * Remote squad mode concept by @spboyer (Shayne Boyer), PR bradygaster/squad#131.
 *
 * @module cli/commands/init-remote
 */

import fs from 'node:fs';
import path from 'node:path';
import { fatal } from '../core/errors.js';

/**
 * Write `.squad/config.json` for remote mode.
 *
 * @param projectDir - Project root (where .squad/ lives or will be created).
 * @param teamRepoPath - Absolute or relative path to the team repo.
 */
export function writeRemoteConfig(projectDir: string, teamRepoPath: string): void {
  const squadDir = path.join(projectDir, '.squad');
  fs.mkdirSync(squadDir, { recursive: true });

  // Always store a relative path from the project root to the team repo
  const absoluteTeam = path.resolve(projectDir, teamRepoPath);
  const relativePath = path.relative(projectDir, absoluteTeam);

  const config = {
    version: 1,
    teamRoot: relativePath,
    projectKey: null,
  };

  fs.writeFileSync(
    path.join(squadDir, 'config.json'),
    JSON.stringify(config, null, 2) + '\n',
    'utf-8',
  );

  // Ensure .squad/config.json is in .gitignore (machine-local path, never commit)
  const gitignorePath = path.join(projectDir, '.gitignore');
  const ignoreEntry = '.squad/config.json';
  let existingIgnore = '';
  if (fs.existsSync(gitignorePath)) {
    existingIgnore = fs.readFileSync(gitignorePath, 'utf-8');
  }
  if (!existingIgnore.includes(ignoreEntry)) {
    const block = (existingIgnore && !existingIgnore.endsWith('\n') ? '\n' : '')
      + '# Squad: local config (machine-specific paths, never commit)\n'
      + ignoreEntry + '\n';
    fs.appendFileSync(gitignorePath, block);
  }
}
