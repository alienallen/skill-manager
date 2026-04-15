import { Command } from 'commander';
import * as path from 'path';
import { loadIndex } from '../lib/store';
import { removeSkill } from '../lib/backup';

export function createRemoveCommand(): Command {
  return new Command('remove')
    .description('Remove a skill (with backup)')
    .argument('<skill-id>', 'Skill ID to remove (e.g., claude:code-review)')
    .option('-f, --force', 'Skip safety checks for shared skills')
    .action(async (skillId: string, options) => {
      const index = loadIndex();
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
        await new Promise<void>((resolve) => {
          process.stdin.once('data', () => {
            resolve();
          });
          // If stdin is not a TTY, just proceed
          if (!process.stdin.isTTY) {
            resolve();
          }
        });
      }

      removeSkill(skill.path, skill.id, skill.name, options.force);
    });
}
