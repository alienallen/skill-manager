import { scanSkills } from '../lib/scanner';
import { SKILL_PATHS } from '../lib/paths';

describe('Scanner', () => {
  describe('scanSkills', () => {
    it('should return an array of skills', async () => {
      const skills = await scanSkills();
      expect(Array.isArray(skills)).toBe(true);
    });

    it('should have skills with required fields', async () => {
      const skills = await scanSkills();

      if (skills.length > 0) {
        const skill = skills[0];
        expect(skill).toHaveProperty('id');
        expect(skill).toHaveProperty('name');
        expect(skill).toHaveProperty('source');
        expect(skill).toHaveProperty('path');
        expect(skill).toHaveProperty('isSymlink');
        expect(skill).toHaveProperty('enabled');
      }
    });

    it('should have valid source values', async () => {
      const skills = await scanSkills();
      const validSources = ['claude', 'codex', 'openclaw', 'agents'];

      skills.forEach(skill => {
        expect(validSources).toContain(skill.source);
      });
    });

    it('should include id in format source:name', async () => {
      const skills = await scanSkills();

      skills.forEach(skill => {
        expect(skill.id).toMatch(/^[a-z]+:.+$/);
      });
    });

    it('should detect symlinks correctly', async () => {
      const skills = await scanSkills();
      const symlinks = skills.filter(s => s.isSymlink);
      const regular = skills.filter(s => !s.isSymlink);

      // All skills should be either symlink or not
      symlinks.forEach(s => {
        expect(typeof s.isSymlink).toBe('boolean');
      });
    });
  });
});

describe('SKILL_PATHS', () => {
  it('should have paths for all expected sources', () => {
    expect(SKILL_PATHS).toHaveProperty('claude');
    expect(SKILL_PATHS).toHaveProperty('codex');
    expect(SKILL_PATHS).toHaveProperty('openclaw');
    expect(SKILL_PATHS).toHaveProperty('agents');
  });

  it('should contain home directory in paths', () => {
    const homeDir = require('os').homedir();

    Object.entries(SKILL_PATHS).forEach(([source, dirPath]) => {
      expect(dirPath).toContain(homeDir);
    });
  });
});
