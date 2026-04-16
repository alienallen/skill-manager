"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scanner_1 = require("../lib/scanner");
const paths_1 = require("../lib/paths");
describe('Scanner', () => {
    describe('scanSkills', () => {
        it('should return an array of skills', async () => {
            const skills = await (0, scanner_1.scanSkills)();
            expect(Array.isArray(skills)).toBe(true);
        });
        it('should have skills with required fields', async () => {
            const skills = await (0, scanner_1.scanSkills)();
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
            const skills = await (0, scanner_1.scanSkills)();
            const validSources = ['claude', 'codex', 'openclaw', 'agents'];
            skills.forEach(skill => {
                expect(validSources).toContain(skill.source);
            });
        });
        it('should include id in format source:name', async () => {
            const skills = await (0, scanner_1.scanSkills)();
            skills.forEach(skill => {
                expect(skill.id).toMatch(/^[a-z]+:.+$/);
            });
        });
        it('should detect symlinks correctly', async () => {
            const skills = await (0, scanner_1.scanSkills)();
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
        expect(paths_1.SKILL_PATHS).toHaveProperty('claude');
        expect(paths_1.SKILL_PATHS).toHaveProperty('codex');
        expect(paths_1.SKILL_PATHS).toHaveProperty('openclaw');
        expect(paths_1.SKILL_PATHS).toHaveProperty('agents');
    });
    it('should contain home directory in paths', () => {
        const homeDir = require('os').homedir();
        Object.entries(paths_1.SKILL_PATHS).forEach(([source, dirPath]) => {
            expect(dirPath).toContain(homeDir);
        });
    });
});
//# sourceMappingURL=scanner.test.js.map