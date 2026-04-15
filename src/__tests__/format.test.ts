import { formatList } from '../lib/format';
import { Skill } from '../types/skill';

describe('Format', () => {
  const mockSkills: Skill[] = [
    {
      id: 'claude:test-skill',
      name: 'Test Skill',
      description: 'A test skill for unit testing',
      source: 'claude',
      path: '/Users/test/.claude/skills/test-skill',
      isSymlink: false,
      enabled: true,
      tags: ['test']
    },
    {
      id: 'codex:code-review',
      name: 'Code Review',
      description: 'Reviews code for bugs and issues',
      source: 'codex',
      path: '/Users/test/.codex/skills/code-review',
      isSymlink: true,
      enabled: true,
      tags: ['review']
    },
    {
      id: 'agents:shared-skill',
      name: 'Shared Skill',
      description: 'A shared skill across tools',
      source: 'agents',
      path: '/Users/test/.agents/skills/shared-skill',
      isSymlink: false,
      enabled: false,
      tags: ['shared']
    }
  ];

  describe('formatList', () => {
    it('should handle empty skills array', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      formatList([], {});
      expect(consoleSpy).toHaveBeenCalledWith('No skills found.');
      consoleSpy.mockRestore();
    });

    it('should filter by source when specified', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      formatList(mockSkills, { source: 'claude' });
      // Should only show Claude skills
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should output JSON when json option is true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const skills = [mockSkills[0]];
      formatList(skills, { json: true });

      const jsonOutput = consoleSpy.mock.calls.join('');
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      consoleSpy.mockRestore();
    });

    it('should group skills by source', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      formatList(mockSkills, {});

      // Check that sources are mentioned
      const output = consoleSpy.mock.calls.join('');
      expect(output).toContain('Claude Code');
      expect(output).toContain('Codex');
      expect(output).toContain('Shared');

      consoleSpy.mockRestore();
    });

    it('should show symlink marker for symlinked skills', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      formatList(mockSkills, {});

      const output = consoleSpy.mock.calls.join('');
      // codex:code-review is a symlink
      expect(output).toContain('🔗');

      consoleSpy.mockRestore();
    });

    it('should show disabled marker for disabled skills', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      formatList(mockSkills, {});

      const output = consoleSpy.mock.calls.join('');
      // agents:shared-skill is disabled
      expect(output).toContain('[disabled]');

      consoleSpy.mockRestore();
    });
  });
});
