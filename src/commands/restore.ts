import { Command } from 'commander';
import { loadIndex } from '../lib/store';
import { restoreSkill } from '../lib/backup';

export function createRestoreCommand(): Command {
  return new Command('restore')
    .description('Restore a recently removed skill')
    .argument('<skill-id>', 'Skill ID to restore')
    .action(async (skillId: string) => {
      const index = loadIndex();
      const skill = index.skills.find(s => s.id === skillId);

      if (skill) {
        console.log(`⚠️  Skill ${skillId} already exists in the index.`);
        console.log(`   It may have been restored already or reinstalled.`);
        process.exit(1);
      }

      restoreSkill(skillId);
    });
}
