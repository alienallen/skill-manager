"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestoreCommand = createRestoreCommand;
const commander_1 = require("commander");
const store_1 = require("../lib/store");
const backup_1 = require("../lib/backup");
function createRestoreCommand() {
    return new commander_1.Command('restore')
        .description('Restore a recently removed skill')
        .argument('<skill-id>', 'Skill ID to restore')
        .action(async (skillId) => {
        const index = (0, store_1.loadIndex)();
        const skill = index.skills.find(s => s.id === skillId);
        if (skill) {
            console.log(`⚠️  Skill ${skillId} already exists in the index.`);
            console.log(`   It may have been restored already or reinstalled.`);
            process.exit(1);
        }
        (0, backup_1.restoreSkill)(skillId);
    });
}
//# sourceMappingURL=restore.js.map