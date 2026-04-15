"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemoveCommand = createRemoveCommand;
const commander_1 = require("commander");
const store_1 = require("../lib/store");
const backup_1 = require("../lib/backup");
function createRemoveCommand() {
    return new commander_1.Command('remove')
        .description('Remove a skill (with backup)')
        .argument('<skill-id>', 'Skill ID to remove (e.g., claude:code-review)')
        .option('-f, --force', 'Skip safety checks for shared skills')
        .action(async (skillId, options) => {
        const index = (0, store_1.loadIndex)();
        const skill = index.skills.find(s => s.id === skillId);
        if (!skill) {
            console.log(`❌ Skill not found: ${skillId}`);
            console.log(`   Run "skillman list" to see available skills.`);
            process.exit(1);
        }
        // Confirm unless forced
        if (!options.force) {
            console.log(`\n⚠️  About to remove: ${skill.name}`);
            console.log(`   Source: ${skill.source}`);
            console.log(`   Path: ${skill.path}`);
            if (skill.isSymlink) {
                console.log(`   ⚠️  This is a symlink.`);
            }
            console.log(`\n   This will backup the skill before removal.`);
            console.log(`   You can restore it with "skillman restore ${skillId}"`);
            console.log(`\n   Press Enter to continue or Ctrl+C to cancel...`);
            // Wait for user confirmation
            await new Promise((resolve) => {
                process.stdin.once('data', () => {
                    resolve();
                });
                // If stdin is not a TTY, just proceed
                if (!process.stdin.isTTY) {
                    resolve();
                }
            });
        }
        (0, backup_1.removeSkill)(skill.path, skill.id, skill.name, options.force);
    });
}
//# sourceMappingURL=remove.js.map