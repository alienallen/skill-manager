import { Command } from 'commander';
import { loadOperations, saveOperations, loadIndex } from '../lib/store';
import { restoreSkill } from '../lib/backup';

export function createUndoCommand(): Command {
  return new Command('undo')
    .description('Undo the last operation')
    .option('--last', 'Undo the last operation (default)')
    .option('--op <id>', 'Undo a specific operation by ID')
    .action(async (options) => {
      const operations = loadOperations();

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
        restoreSkill(op.skillId);
        // Remove the operation since it was undone
        saveOperations(operations.slice(1));
        console.log('\n✅ Undo complete.');
      } catch (err) {
        console.error(`❌ Undo failed: ${err}`);
        process.exit(1);
      }
    });
}
