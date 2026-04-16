import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadIndex, saveIndex } from '../lib/store';

function isSymlink(targetPath: string): boolean {
  try {
    return fs.lstatSync(targetPath).isSymbolicLink();
  } catch {
    return false;
  }
}

function getRealPath(symlinkPath: string): string {
  try {
    return fs.readlinkSync(symlinkPath);
  } catch {
    return symlinkPath;
  }
}

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

      const skillPath = skill.path;
      const isSym = isSymlink(skillPath);

      try {
        if (isSym) {
          // Handle symlink: enable the real .disabled version
          const realPath = getRealPath(skillPath);
          const disabledRealPath = realPath + '.disabled';
          const enabledRealPath = realPath.replace(new RegExp('\\.disabled$'), '');

          if (!fs.existsSync(disabledRealPath)) {
            console.log(`❌ Disabled version not found: ${disabledRealPath}`);
            process.exit(1);
          }

          // Rename .disabled version back
          fs.renameSync(disabledRealPath, enabledRealPath);

          // Remove old symlink and create new one pointing to enabled version
          fs.unlinkSync(skillPath);
          const relativePath = path.relative(path.dirname(skillPath), enabledRealPath);
          fs.symlinkSync(relativePath, skillPath);

          skill.path = skillPath.replace(/\.disabled$/, '');
          skill.enabled = true;
          saveIndex(index);

          console.log(`✅ Enabled: ${skill.name} (shared skill)`);
        } else {
          // Handle regular directory
          const enabledPath = skillPath.replace('.disabled', '');
          fs.renameSync(skillPath, enabledPath);
          skill.path = enabledPath;
          skill.enabled = true;
          saveIndex(index);

          console.log(`✅ Enabled: ${skill.name}`);
        }
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

      const skillPath = skill.path;
      const isSym = isSymlink(skillPath);

      try {
        if (isSym) {
          // Handle symlink: disable the real directory
          const realPath = getRealPath(skillPath);
          const skillName = path.basename(skillPath);
          const disabledRealPath = path.join(path.dirname(realPath), '.disabled', skillName);

          // Create .disabled directory if needed
          const disabledDir = path.join(path.dirname(realPath), '.disabled');
          if (!fs.existsSync(disabledDir)) {
            fs.mkdirSync(disabledDir, { recursive: true });
          }

          // Move real directory to .disabled
          fs.renameSync(realPath, disabledRealPath);

          // Remove old symlink
          fs.unlinkSync(skillPath);

          // Create new symlink pointing to .disabled version
          const relativePath = path.relative(path.dirname(skillPath), disabledRealPath);
          fs.symlinkSync(relativePath, skillPath);

          // Update index to reflect the new symlink path (which still ends with .disabled)
          skill.enabled = false;
          saveIndex(index);

          console.log(`✅ Disabled: ${skill.name} (shared skill)`);
          console.log(`   ⚠️  This affects all tools using this shared skill.`);
        } else {
          // Handle regular directory
          const disabledPath = skillPath + '.disabled';
          fs.renameSync(skillPath, disabledPath);
          skill.path = disabledPath;
          skill.enabled = false;
          saveIndex(index);

          console.log(`✅ Disabled: ${skill.name}`);
        }
      } catch (err) {
        console.error(`❌ Failed to disable skill: ${err}`);
        process.exit(1);
      }
    });
}
