"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUndoCommand = createUndoCommand;
const commander_1 = require("commander");
const store_1 = require("../lib/store");
const backup_1 = require("../lib/backup");
function createUndoCommand() {
    return new commander_1.Command('undo')
        .description('Undo the last operation')
        .option('--last', 'Undo the last operation (default)')
        .option('--op <id>', 'Undo a specific operation by ID')
        .action(async (options) => {
        const operations = (0, store_1.loadOperations)();
        if (operations.length === 0) {
            console.log('No operations to undo.');
            return;
        }
        const op = operations[0]; // Most recent
        if (op.type !== 'remove') {
            console.log(`❌ Cannot undo operation type: ${op.type}`);
            console.log(`   Only "remove" operations can be undone.`);
            process.exit(1);
        }
        console.log(`\n🔄 Undoing: ${op.type} of ${op.skillName}`);
        console.log(`   Removed at: ${op.timestamp}`);
        // Perform restore
        try {
            (0, backup_1.restoreSkill)(op.skillId);
            // Remove the operation since it was undone
            (0, store_1.saveOperations)(operations.slice(1));
            console.log('\n✅ Undo complete.');
        }
        catch (err) {
            console.error(`❌ Undo failed: ${err}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=undo.js.map