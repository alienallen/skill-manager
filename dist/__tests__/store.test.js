"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const store_1 = require("../lib/store");
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
            const index = (0, store_1.loadIndex)();
            expect(index).toHaveProperty('version');
            expect(index).toHaveProperty('skills');
            expect(Array.isArray(index.skills)).toBe(true);
        });
    });
    describe('saveIndex and loadIndex', () => {
        it('should save and load index correctly', () => {
            const testIndex = {
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
            (0, store_1.saveIndex)(testIndex);
            const loaded = (0, store_1.loadIndex)();
            expect(loaded.version).toBe('1.0');
            expect(loaded.skills.length).toBe(1);
            expect(loaded.skills[0].id).toBe('test:skill-1');
        });
    });
    describe('loadOperations', () => {
        it('should return empty array when file does not exist', () => {
            const operations = (0, store_1.loadOperations)();
            expect(Array.isArray(operations)).toBe(true);
        });
    });
    describe('saveOperations and loadOperations', () => {
        it('should save and load operations correctly', () => {
            const testOperations = [
                {
                    id: 'op-1',
                    type: 'remove',
                    skillId: 'test:skill-1',
                    skillName: 'Test Skill 1',
                    originalPath: '/Users/test/.claude/skills/test-skill',
                    backupPath: '/tmp/backup',
                    timestamp: '2026-04-15T10:00:00Z',
                    expiresAt: '2026-04-15T10:30:00Z'
                }
            ];
            (0, store_1.saveOperations)(testOperations);
            const loaded = (0, store_1.loadOperations)();
            expect(loaded.length).toBe(1);
            expect(loaded[0].id).toBe('op-1');
            expect(loaded[0].type).toBe('remove');
        });
    });
});
//# sourceMappingURL=store.test.js.map