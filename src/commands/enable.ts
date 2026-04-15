import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadIndex, saveIndex, addOperation } from '../lib/store';
import { Operation } from '../types/skill';

export function createEnableCommand(): Command {
  return new Command('enable')
    .description('Enable a disabled skill')
    .argument('<skill-id>', 'Skill ID to enable')
    .action(async (skillId: string) => {
      const index = loadIndex();
      const skill = index.skills.find(s => s.id === skillId);

      if (!skill) {
        console.log(`❌ Skill not found: ${skillId}`);
        process.exit(1);
      }

      if (skill.enabled) {
        console.log(`✅ Skill ${skill.name} is already enabled.`);
        return;
      }

      // Move from disabled directory back to enabled
      const disabledPath = skill.path;
      const enabledPath = disabledPath.replace('.disabled', '');

      try {
        fs.renameSync(disabledPath, enabledPath);
        skill.path = enabledPath;
        skill.enabled = true;
        saveIndex(index);

        console.log(`✅ Enabled: ${skill.name}`);
      } catch (err) {
        console.error(`❌ Failed to enable skill: ${err}`);
        process.exit(1);
      }
    });
}

export function createDisableCommand(): Command {
  return new Command('disable')
    .description('Disable a skill (moves to .disabled directory)')
    .argument('<skill-id>', 'Skill ID to disable')
    .action(async (skillId: string) => {
      const index = loadIndex();
      const skill = index.skills.find(s => s.id === skillId);

      if (!skill) {
        console.log(`❌ Skill not found: ${skillId}`);
        process.exit(1);
      }

      if (!skill.enabled) {
        console.log(`⚠️  Skill ${skill.name} is already disabled.`);
        return;
      }

      // Move to disabled directory
      const disabledPath = skill.path + '.disabled';

      try {
        fs.renameSync(skill.path, disabledPath);
        skill.path = disabledPath;
        skill.enabled = false;
        saveIndex(index);

        console.log(`✅ Disabled: ${skill.name}`);
        console.log(`   Run "skillman enable ${skillId}" to re-enable.`);
      } catch (err) {
        console.error(`❌ Failed to disable skill: ${err}`);
        process.exit(1);
      }
    });
}
