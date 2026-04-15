import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { Skill } from '../types/skill';
import { SKILL_PATHS } from './paths';

interface ParsedSkill {
  name?: string;
  description?: string;
  tags?: string[];
  version?: string;
}

export async function scanSkills(): Promise<Skill[]> {
  const skills: Skill[] = [];

  for (const [source, dir] of Object.entries(SKILL_PATHS)) {
    if (!fs.existsSync(dir)) continue;

    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.lstatSync(fullPath);

        if (!stat.isDirectory() && !stat.isSymbolicLink()) continue;

        const skill = await parseSkill(fullPath, entry, source as any, stat.isSymbolicLink());
        if (skill) {
          skills.push(skill);
        }
      }
    } catch (err) {
      console.error(`Error scanning ${dir}: ${err}`);
    }
  }

  return skills;
}

async function parseSkill(
  skillPath: string,
  entryName: string,
  source: 'claude' | 'codex' | 'openclaw' | 'agents',
  isSymlink: boolean
): Promise<Skill | null> {
  try {
    // Try SKILL.md first (Claude/Codex format)
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const metaJsonPath = path.join(skillPath, '_meta.json');

    let name = entryName;
    let description = '';
    let tags: string[] = [];

    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const parsed = parseFrontmatter(content);
      if (parsed.name) name = parsed.name;
      if (parsed.description) description = parsed.description;
      if (parsed.tags) tags = parsed.tags;
    } else if (fs.existsSync(metaJsonPath)) {
      // OpenClaw format
      const content = fs.readFileSync(metaJsonPath, 'utf-8');
      try {
        const meta = JSON.parse(content);
        if (meta.name) name = meta.name;
        if (meta.description) description = meta.description;
        if (meta.tags) tags = meta.tags;
      } catch {
        // Invalid JSON, ignore
      }
    }

    // Check if skill is enabled (not in disabled directory)
    const parentDir = path.dirname(skillPath);
    const enabled = !parentDir.endsWith('.disabled');

    return {
      id: `${source}:${entryName}`,
      name,
      description,
      source,
      path: skillPath,
      isSymlink,
      enabled,
      tags,
    };
  } catch (err) {
    return null;
  }
}

function parseFrontmatter(content: string): ParsedSkill {
  const result: ParsedSkill = {};

  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3);
    if (endIndex !== -1) {
      const frontmatter = content.slice(3, endIndex).trim();
      try {
        const parsed = yaml.parse(frontmatter);
        if (parsed) {
          result.name = parsed.name;
          result.description = parsed.description;
          result.tags = parsed.tags;
          result.version = parsed.version;
        }
      } catch {
        // Invalid YAML, return empty
      }
    }
  }

  return result;
}
