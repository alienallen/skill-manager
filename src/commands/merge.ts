import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { loadIndex, saveIndex } from '../lib/store';
import { Skill } from '../types/skill';

interface MergeCandidate {
  skill: Skill;
  sharedPath: string | null;
  sharedExists: boolean;
  isSymlinkAlready: boolean;
  canMerge: boolean;
  reason: string;
}

function getSharedPath(skill: Skill): string {
  const home = require('os').homedir();
  const name = skill.id.includes(':') ? skill.id.split(':')[1] : skill.id;
  return path.join(home, '.agents', 'skills', name);
}

function checkSymlink(targetPath: string): boolean {
  try {
    const stat = fs.lstatSync(targetPath);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

function filesIdentical(dir1: string, dir2: string): boolean {
  try {
    const output = execSync(`diff -r "${dir1}" "${dir2}" 2>/dev/null`, { encoding: 'utf-8' });
    return output.trim() === '';
  } catch {
    return false;
  }
}

function scanMergeCandidates(skills: Skill[]): MergeCandidate[] {
  const candidates: MergeCandidate[] = [];
  const sharedDirs = ['claude', 'openclaw'];

  for (const skill of skills) {
    if (!sharedDirs.includes(skill.source)) continue;

    const sharedPath = getSharedPath(skill);
    const sharedExists = fs.existsSync(sharedPath);
    const isSymlinkAlready = checkSymlink(skill.path);
    const isDir = fs.existsSync(skill.path) && !isSymlinkAlready;

    let canMerge = false;
    let reason = '';

    if (isSymlinkAlready) {
      reason = 'Already a symlink';
      canMerge = false;
    } else if (!isDir) {
      reason = 'Not a directory (not a real skill)';
      canMerge = false;
    } else if (!sharedExists) {
      reason = 'No shared version exists';
      canMerge = false;
    } else if (filesIdentical(skill.path, sharedPath)) {
      reason = 'Content identical - can merge';
      canMerge = true;
    } else {
      reason = 'Content differs - manual merge required';
      canMerge = false;
    }

    candidates.push({
      skill,
      sharedPath,
      sharedExists,
      isSymlinkAlready,
      canMerge,
      reason,
    });
  }

  return candidates;
}

export function createMergeCommand(): Command {
  return new Command('merge')
    .description('Merge duplicate skills into shared storage (via symlinks)')
    .option('-n, --dry-run', 'Show what would be merged without making changes')
    .option('-f, --force', 'Skip confirmation')
    .option('--source <source>', 'Only merge skills from specific source (claude, openclaw)')
    .action(async (options) => {
      const index = loadIndex();

      if (index.skills.length === 0) {
        console.log('No skills indexed. Run "skillman index" first.');
        return;
      }

      // Filter by source if specified
      let skillsToScan = index.skills;
      if (options.source) {
        skillsToScan = index.skills.filter(s => s.source === options.source);
        if (skillsToScan.length === 0) {
          console.log(`No skills found for source: ${options.source}`);
          return;
        }
      }

      console.log(`\n🔍 Scanning ${skillsToScan.length} skills for merge candidates...\n`);

      // Create a temporary index-like object for scanMergeCandidates
      const tempIndex = { ...index, skills: skillsToScan };
      const candidates = scanMergeCandidates(skillsToScan);
      const mergeable = candidates.filter(c => c.canMerge);
      const alreadyLinked = candidates.filter(c => c.isSymlinkAlready);
      const noShared = candidates.filter(c => !c.sharedExists && !c.isSymlinkAlready);
      const contentDiffers = candidates.filter(c => !c.canMerge && !c.isSymlinkAlready && c.sharedExists && c.reason.includes('differs'));

      console.log(`📊 Analysis:\n`);
      console.log(`   Mergeable (identical content): ${mergeable.length}`);
      console.log(`   Already symlinked: ${alreadyLinked.length}`);
      console.log(`   No shared version: ${noShared.length}`);
      console.log(`   Content differs: ${contentDiffers.length}`);

      if (mergeable.length === 0) {
        console.log('\n✅ No skills need merging.');
        return;
      }

      console.log(`\n📋 Skills that can be merged:\n`);
      for (const c of mergeable) {
        const name = c.skill.name || c.skill.id;
        console.log(`   ${c.skill.source}: ${name}`);
        console.log(`      Skill:  ${c.skill.path}`);
        console.log(`      Shared: ${c.sharedPath}`);
        console.log('');
      }

      if (options.dryRun) {
        console.log('🔍 [Dry Run] No changes made.');
        console.log('\n   To merge, run without --dry-run:');
        console.log('   skillman merge');
        return;
      }

      // Confirm before proceeding
      if (!options.force) {
        console.log(`\n⚠️  About to merge ${mergeable.length} skills.`);
        console.log('   This will:');
        console.log('   1. Backup original to ~/.skill-manager/backup/');
        console.log('   2. Delete the original directory');
        console.log('   3. Create symlink pointing to shared location');
        console.log('\n   Press Enter to continue or Ctrl+C to cancel...');

        await new Promise<void>((resolve) => {
          if (!process.stdin.isTTY) {
            resolve();
            return;
          }
          process.stdin.once('data', () => resolve());
        });
      }

      // Perform merge
      console.log('\n🔄 Merging...\n');
      let merged = 0;
      let failed = 0;

      for (const c of mergeable) {
        const skill = c.skill;
        const skillName = skill.name || skill.id;
        const backupDir = path.join(require('os').homedir(), '.skill-manager', 'backup');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `${skill.id.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}`);

        try {
          // Ensure backup dir exists
          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }

          // Backup original
          execSync(`cp -r "${skill.path}" "${backupPath}"`, { stdio: 'pipe' });

          // Remove original
          fs.rmSync(skill.path, { recursive: true, force: true });

          // Create symlink
          const relativePath = path.relative(path.dirname(skill.path), c.sharedPath!);
          fs.symlinkSync(relativePath, skill.path);

          console.log(`   ✅ ${skillName}`);
          merged++;
        } catch (err) {
          console.log(`   ❌ ${skillName}: ${err}`);
          failed++;
        }
      }

      console.log(`\n✅ Merged ${merged} skills. ${failed} failed.`);

      // Update index
      console.log('\n📝 Updating index...');
      const updatedSkills = index.skills.map(s => {
        const merged = mergeable.find(c => c.skill.id === s.id);
        if (merged) {
          return { ...s, isSymlink: true };
        }
        return s;
      });
      index.skills = updatedSkills;
      saveIndex(index);
      console.log('✅ Index updated. Run "skillman index --force" to rebuild.');
    });
}
