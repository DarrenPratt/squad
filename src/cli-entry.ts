#!/usr/bin/env node

/**
 * Squad CLI — standalone entry point for npx distribution.
 * Bundled by esbuild into cli.js at the package root.
 * Contains ONLY the CLI; SDK library exports live in dist/index.js.
 */

import { fatal } from './cli/core/errors.js';
import { BOLD, RESET } from './cli/core/output.js';
import { runInit } from './cli/core/init.js';

const VERSION = '0.6.0-alpha.0';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const cmd = args[0];

  // --version / -v
  if (cmd === '--version' || cmd === '-v') {
    console.log(`squad ${VERSION}`);
    process.exit(0);
  }

  // --help / -h / help
  if (cmd === '--help' || cmd === '-h' || cmd === 'help') {
    console.log(`\n${BOLD}squad${RESET} v${VERSION} — Add an AI agent team to any project\n`);
    console.log(`Usage: npx github:bradygaster/squad-sdk [command]\n`);
    console.log(`Commands:`);
    console.log(`  ${BOLD}(default)${RESET}  Initialize Squad (skip files that already exist)`);
    console.log(`  ${BOLD}upgrade${RESET}    Update Squad-owned files to latest version`);
    console.log(`             Overwrites: squad.agent.md, templates dir (.squad-templates/ or .ai-team-templates/)`);
    console.log(`             Never touches: .squad/ or .ai-team/ (your team state)`);
    console.log(`             Flags: --migrate-directory (rename .ai-team/ → .squad/)`);
    console.log(`  ${BOLD}copilot${RESET}    Add/remove the Copilot coding agent (@copilot)`);
    console.log(`             Usage: copilot [--off] [--auto-assign]`);
    console.log(`  ${BOLD}watch${RESET}      Run Ralph's work monitor as a local polling process`);
    console.log(`             Usage: watch [--interval <minutes>]`);
    console.log(`             Default: checks every 10 minutes (Ctrl+C to stop)`);
    console.log(`  ${BOLD}plugin${RESET}     Manage plugin marketplaces`);
    console.log(`             Usage: plugin marketplace add|remove|list|browse`);
    console.log(`  ${BOLD}export${RESET}     Export squad to a portable JSON snapshot`);
    console.log(`             Default: squad-export.json (use --out <path> to override)`);
    console.log(`  ${BOLD}import${RESET}     Import squad from an export file`);
    console.log(`             Usage: import <file> [--force]`);
    console.log(`  ${BOLD}scrub-emails${RESET}  Remove email addresses from Squad state files`);
    console.log(`             Usage: scrub-emails [directory] (default: .ai-team/)`);
    console.log(`  ${BOLD}help${RESET}       Show this help message`);
    console.log(`\nFlags:`);
    console.log(`  ${BOLD}--version, -v${RESET}  Print version`);
    console.log(`  ${BOLD}--help, -h${RESET}     Show help`);
    console.log(`\nInsider channel: npx github:bradygaster/squad-sdk#insider\n`);
    process.exit(0);
  }

  // Route subcommands
  if (!cmd || cmd === 'init') {
    runInit(process.cwd()).catch(err => {
      fatal(err.message);
    });
    return;
  }

  if (cmd === 'upgrade') {
    const { runUpgrade } = await import('./cli/core/upgrade.js');
    const { migrateDirectory } = await import('./cli/core/migrate-directory.js');
    
    const migrateDir = args.includes('--migrate-directory');
    const selfUpgrade = args.includes('--self');
    
    if (migrateDir) {
      await migrateDirectory(process.cwd());
    }
    
    await runUpgrade(process.cwd(), { 
      migrateDirectory: migrateDir,
      self: selfUpgrade
    });
    
    process.exit(0);
  }

  if (cmd === 'watch') {
    const { runWatch } = await import('./cli/commands/watch.js');
    const intervalIdx = args.indexOf('--interval');
    const intervalMinutes = (intervalIdx !== -1 && args[intervalIdx + 1])
      ? parseInt(args[intervalIdx + 1], 10)
      : 10;
    await runWatch(process.cwd(), intervalMinutes);
    return;
  }

  if (cmd === 'export') {
    const { runExport } = await import('./cli/commands/export.js');
    const outIdx = args.indexOf('--out');
    const outPath = (outIdx !== -1 && args[outIdx + 1]) ? args[outIdx + 1] : undefined;
    await runExport(process.cwd(), outPath);
    process.exit(0);
  }

  if (cmd === 'import') {
    const { runImport } = await import('./cli/commands/import.js');
    const importFile = args[1];
    if (!importFile) {
      fatal('Usage: squad import <file> [--force]');
    }
    const hasForce = args.includes('--force');
    await runImport(process.cwd(), importFile, hasForce);
    process.exit(0);
  }

  if (cmd === 'plugin') {
    const { runPlugin } = await import('./cli/commands/plugin.js');
    await runPlugin(process.cwd(), args.slice(1));
    process.exit(0);
  }

  if (cmd === 'copilot') {
    const { runCopilot } = await import('./cli/commands/copilot.js');
    const isOff = args.includes('--off');
    const autoAssign = args.includes('--auto-assign');
    await runCopilot(process.cwd(), { off: isOff, autoAssign });
    process.exit(0);
  }

  if (cmd === 'scrub-emails') {
    const { scrubEmails } = await import('./cli/core/email-scrub.js');
    const targetDir = args[1] || '.ai-team';
    const count = await scrubEmails(targetDir);
    if (count > 0) {
      console.log(`Scrubbed ${count} email address(es).`);
    } else {
      console.log('No email addresses found.');
    }
    process.exit(0);
  }

  // Unknown command
  fatal(`Unknown command: ${cmd}\n       Run 'squad help' for usage information.`);
}

main();
