import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Operation } from '../types/skill';
import { TRASH_DIR, SKILL_MANAGER_DIR, getSymlinkTargets } from './paths';
import { addOperation, loadIndex, saveIndex, loadOperations, saveOperations } from './store';

export function ensureTrashDir(): void {
  if (!fs.existsSync(TRASH_DIR)) {
    fs.mkdirSync(TRASH_DIR, { recursive: true });
  }
}

export function backupSkill(skillPath: string, skillId: string, skillName: string): string {
  ensureTrashDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${skillId.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}`;
  const backupPath = path.join(TRASH_DIR, backupName);

  try {
    // Use cp -r to preserve all attributes and contents
    execSync(`cp -r "${skillPath}" "${backupPath}"`, { stdio: 'pipe' });
  } catch (err) {
    throw new Error(`Failed to backup skill: ${err}`);
  }

  return backupPath;
}

export function removeSkill(skillPath: string, skillId: string, skillName: string, force: boolean = false): void {
  // Check for symlink references
  const targets = getSymlinkTargets(skillPath);
  const isSharedSkill = targets.length > 0;

  if (isSharedSkill && !force) {
    console.log(`⚠️  This skill is shared and referenced by: ${targets.join(', ')}`);
    console.log(`   Deleting it may affect other tools. Use --force to override.`);
    process.exit(1);
  }

  // Create backup
  const backupPath = backupSkill(skillPath, skillId, skillName);

  // Remove original
  try {
    fs.rmSync(skillPath, { recursive: true, force: true });
  } catch (err) {
    throw new Error(`Failed to remove skill: ${err}`);
  }

  // Update index to remove the skill
  const index = loadIndex();
  index.skills = index.skills.filter(s => s.id !== skillId);
  saveIndex(index);

  // Record operation with original path
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
  const operation: Operation = {
    id: `op-${Date.now()}`,
    type: 'remove',
    skillId,
    skillName,
    originalPath: skillPath,
    backupPath,
    timestamp: new Date().toISOString(),
    expiresAt,
  };
  addOperation(operation);

  console.log(`✅ Removed: ${skillName}`);
  console.log(`   Backup location: ${backupPath}`);
  console.log(`   Run 'skillman restore ${skillId}' to undo`);
}

export function restoreSkill(skillId: string): void {
  const operations = loadOperations().filter(op => op.skillId === skillId && op.type === 'remove');
  if (operations.length === 0) {
    console.log(`❌ No removal operation found for ${skillId}`);
    process.exit(1);
  }

  const latestOp = operations[0];
  const backupPath = latestOp.backupPath;
  const originalPath = latestOp.originalPath;

  if (!fs.existsSync(backupPath)) {
    console.log(`❌ Backup not found: ${backupPath}`);
    console.log(`   The backup may have expired or been manually deleted.`);
    process.exit(1);
  }

  // Restore to original path
  try {
    fs.mkdirSync(path.dirname(originalPath), { recursive: true });
    execSync(`cp -r "${backupPath}" "${originalPath}"`, { stdio: 'pipe' });
  } catch (err) {
    throw new Error(`Failed to restore skill: ${err}`);
  }

  console.log(`✅ Restored: ${latestOp.skillName}`);
  console.log(`   Location: ${originalPath}`);

  // Remove the operation since it was undone
  const allOps = loadOperations();
  const updatedOps = allOps.filter(op => op.id !== latestOp.id);
  saveOperations(updatedOps);
}

export function cleanExpiredTrash(): number {
  ensureTrashDir();
  const operations = loadOperations();
  const now = Date.now();
  let cleaned = 0;

  for (const op of operations) {
    if (op.expiresAt && new Date(op.expiresAt).getTime() < now) {
      if (fs.existsSync(op.backupPath)) {
        try {
          fs.rmSync(op.backupPath, { recursive: true, force: true });
          cleaned++;
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  return cleaned;
}
