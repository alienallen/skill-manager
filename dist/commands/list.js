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
        .option('--claude', 'Only list Claude Code skills')
        .option('--codex', 'Only list Codex skills')
        .option('--openclaw', 'Only list OpenClaw skills')
        .option('--agents', 'Only list shared/agents skills')
        .option('--json', 'Output as JSON')
        .action(async (options) => {
        // Map shorthand options to source
        if (options.claude)
            options.source = 'claude';
        if (options.codex)
            options.source = 'codex';
        if (options.openclaw)
            options.source = 'openclaw';
        if (options.agents)
            options.source = 'agents';
        const index = (0, store_1.loadIndex)();
        if (index.skills.length === 0) {
            console.log('No skills indexed. Run "skillman index" first.');
            return;
        }
        (0, format_1.formatList)(index.skills, options);
    });
}
//# sourceMappingURL=list.js.map