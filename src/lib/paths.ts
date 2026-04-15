import * as os from 'os';
import * as path from 'path';

export const HOME = os.homedir();

export const SKILL_MANAGER_DIR = path.join(HOME, '.skill-manager');
export const TRASH_DIR = path.join(SKILL_MANAGER_DIR, 'trash');
export const INDEX_FILE = path.join(SKILL_MANAGER_DIR, 'index.json');
export const OPERATIONS_FILE = path.join(SKILL_MANAGER_DIR, 'operations.json');

// Skill source paths
export const SKILL_PATHS = {
  claude: path.join(HOME, '.claude', 'skills'),
  codex: path.join(HOME, '.codex', 'skills'),
  openclaw: path.join(HOME, '.openclaw', 'skills'),
  agents: path.join(HOME, '.agents', 'skills'),
};

export function getSymlinkTargets(skillPath: string): string[] {
  const targets: string[] = [];
  for (const [source, dir] of Object.entries(SKILL_PATHS)) {
    if (dir === skillPath) continue;
    try {
      const entries = require('fs').readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = require('fs').lstatSync(fullPath);
        if (stat.isSymbolicLink()) {
          const linkTarget = require('fs').readlinkSync(fullPath);
          if (linkTarget.includes(skillPath) || linkTarget === skillPath) {
            targets.push(`${source}:${entry}`);
          }
        }
      }
    } catch {
      // Directory doesn't exist or not accessible
    }
  }
  return targets;
}
