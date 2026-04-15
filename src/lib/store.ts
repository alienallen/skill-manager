import * as fs from 'fs';
import * as path from 'path';
import { SkillIndex, Operation } from '../types/skill';
import { INDEX_FILE, OPERATIONS_FILE, SKILL_MANAGER_DIR } from './paths';

export function ensureSkillManagerDir(): void {
  if (!fs.existsSync(SKILL_MANAGER_DIR)) {
    fs.mkdirSync(SKILL_MANAGER_DIR, { recursive: true });
  }
}

export function loadIndex(): SkillIndex {
  ensureSkillManagerDir();
  if (!fs.existsSync(INDEX_FILE)) {
    return { version: '1.0', lastScan: '', skills: [] };
  }
  try {
    const content = fs.readFileSync(INDEX_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { version: '1.0', lastScan: '', skills: [] };
  }
}

export function saveIndex(index: SkillIndex): void {
  ensureSkillManagerDir();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export function loadOperations(): Operation[] {
  ensureSkillManagerDir();
  if (!fs.existsSync(OPERATIONS_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(OPERATIONS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export function saveOperations(operations: Operation[]): void {
  ensureSkillManagerDir();
  fs.writeFileSync(OPERATIONS_FILE, JSON.stringify(operations, null, 2));
}

export function addOperation(op: Operation): void {
  const operations = loadOperations();
  operations.unshift(op); // Add to beginning
  // Keep only last 100 operations
  if (operations.length > 100) {
    operations.pop();
  }
  saveOperations(operations);
}
