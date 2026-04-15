import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadIndex, saveIndex, loadOperations, saveOperations } from '../lib/store';
import { SkillIndex, Operation } from '../types/skill';

const TEST_DIR = path.join(os.tmpdir(), 'skill-manager-test');
const INDEX_FILE = path.join(TEST_DIR, 'index.json');
const OPERATIONS_FILE = path.join(TEST_DIR, 'operations.json');

describe('Store', () => {
  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('loadIndex', () => {
    it('should return empty index when file does not exist', () => {
      // This will create the dir if needed
      const index = loadIndex();
      expect(index).toHaveProperty('version');
      expect(index).toHaveProperty('skills');
      expect(Array.isArray(index.skills)).toBe(true);
    });
  });

  describe('saveIndex and loadIndex', () => {
    it('should save and load index correctly', () => {
      const testIndex: SkillIndex = {
        version: '1.0',
        lastScan: '2026-04-15T10:00:00Z',
        skills: [
          {
            id: 'test:skill-1',
            name: 'Test Skill 1',
            description: 'A test skill',
            source: 'claude',
            path: '/tmp/test',
            isSymlink: false,
            enabled: true,
            tags: ['test']
          }
        ]
      };

      saveIndex(testIndex);

      const loaded = loadIndex();
      expect(loaded.version).toBe('1.0');
      expect(loaded.skills.length).toBe(1);
      expect(loaded.skills[0].id).toBe('test:skill-1');
    });
  });

  describe('loadOperations', () => {
    it('should return empty array when file does not exist', () => {
      const operations = loadOperations();
      expect(Array.isArray(operations)).toBe(true);
    });
  });

  describe('saveOperations and loadOperations', () => {
    it('should save and load operations correctly', () => {
      const testOperations: Operation[] = [
        {
          id: 'op-1',
          type: 'remove',
          skillId: 'test:skill-1',
          skillName: 'Test Skill 1',
          backupPath: '/tmp/backup',
          timestamp: '2026-04-15T10:00:00Z',
          expiresAt: '2026-04-15T10:30:00Z'
        }
      ];

      saveOperations(testOperations);

      const loaded = loadOperations();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('op-1');
      expect(loaded[0].type).toBe('remove');
    });
  });
});
