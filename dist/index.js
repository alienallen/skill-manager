#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const index_1 = require("./commands/index");
const list_1 = require("./commands/list");
const remove_1 = require("./commands/remove");
const restore_1 = require("./commands/restore");
const enable_1 = require("./commands/enable");
const undo_1 = require("./commands/undo");
const program = new commander_1.Command();
program
    .name('skillman')
    .description('Manage AI Skills across Claude Code, Codex, and OpenClaw')
    .version('1.0.0');
program.addCommand((0, index_1.createIndexCommand)());
program.addCommand((0, list_1.createListCommand)());
program.addCommand((0, remove_1.createRemoveCommand)());
program.addCommand((0, restore_1.createRestoreCommand)());
program.addCommand((0, enable_1.createEnableCommand)());
program.addCommand((0, enable_1.createDisableCommand)());
program.addCommand((0, undo_1.createUndoCommand)());
// Default command - show help if no arguments
if (process.argv.length === 2) {
    program.parse(['node', 'skillman', '--help']);
}
else {
    program.parse(process.argv);
}
//# sourceMappingURL=index.js.map