"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListCommand = createListCommand;
const commander_1 = require("commander");
const store_1 = require("../lib/store");
const format_1 = require("../lib/format");
function createListCommand() {
    return new commander_1.Command('list')
        .description('List all installed skills')
        .option('--source <source>', 'Filter by source (claude, codex, openclaw, agents)')
        .option('--json', 'Output as JSON')
        .action(async (options) => {
        const index = (0, store_1.loadIndex)();
        if (index.skills.length === 0) {
            console.log('No skills indexed. Run "skillman index" first.');
            return;
        }
        (0, format_1.formatList)(index.skills, options);
    });
}
//# sourceMappingURL=list.js.map