/**
 * Version stamping and reading utilities — zero dependencies
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get package version from package.json
 */
export function getPackageVersion(): string {
  const currentFile = fileURLToPath(import.meta.url);
  const pkgPath = path.join(path.dirname(currentFile), '..', '..', '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

/**
 * Stamp version into squad.agent.md after copying
 */
export function stampVersion(filePath: string, version: string): void {
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace version in HTML comment (must come immediately after frontmatter closing ---)
  content = content.replace(/<!-- version: [^>]+ -->/m, `<!-- version: ${version} -->`);
  // Replace version in the Identity section's Version line
  content = content.replace(/- \*\*Version:\*\* [0-9.]+(?:-[a-z]+)?/m, `- **Version:** ${version}`);
  // Replace {version} placeholder in the greeting instruction so it's unambiguous
  content = content.replace(/`Squad v\{version\}`/g, `\`Squad v${version}\``);
  fs.writeFileSync(filePath, content);
}

/**
 * Read version from squad.agent.md HTML comment
 */
export function readInstalledVersion(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    // Try to read from HTML comment first (new format)
    const commentMatch = content.match(/<!-- version: ([0-9.]+(?:-[a-z]+)?) -->/);
    if (commentMatch) return commentMatch[1];
    // Fallback: try old frontmatter format for backward compatibility during upgrade
    const frontmatterMatch = content.match(/^version:\s*"([^"]+)"/m);
    return frontmatterMatch ? frontmatterMatch[1] : '0.0.0';
  } catch {
    return '0.0.0';
  }
}
