#!/usr/bin/env node

import { Command } from 'commander';
import { createIndexCommand } from './commands/index';
import { createListCommand } from './commands/list';
import { createRemoveCommand } from './commands/remove';
import { createRestoreCommand } from './commands/restore';
import { createEnableCommand, createDisableCommand } from './commands/enable';
import { createUndoCommand } from './commands/undo';

const program = new Command();

program
  .name('skillman')
  .description('Manage AI Skills across Claude Code, Codex, and OpenClaw')
  .version('1.0.0');

program.addCommand(createIndexCommand());
program.addCommand(createListCommand());
program.addCommand(createRemoveCommand());
program.addCommand(createRestoreCommand());
program.addCommand(createEnableCommand());
program.addCommand(createDisableCommand());
program.addCommand(createUndoCommand());

// Default command - show help if no arguments
if (process.argv.length === 2) {
  program.parse(['node', 'skillman', '--help']);
} else {
  program.parse(process.argv);
}
