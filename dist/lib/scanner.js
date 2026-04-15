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
exports.scanSkills = scanSkills;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("yaml"));
const paths_1 = require("./paths");
async function scanSkills() {
    const skills = [];
    for (const [source, dir] of Object.entries(paths_1.SKILL_PATHS)) {
        if (!fs.existsSync(dir))
            continue;
        try {
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
                const fullPath = path.join(dir, entry);
                const stat = fs.lstatSync(fullPath);
                if (!stat.isDirectory() && !stat.isSymbolicLink())
                    continue;
                const skill = await parseSkill(fullPath, entry, source, stat.isSymbolicLink());
                if (skill) {
                    skills.push(skill);
                }
            }
        }
        catch (err) {
            console.error(`Error scanning ${dir}: ${err}`);
        }
    }
    return skills;
}
async function parseSkill(skillPath, entryName, source, isSymlink) {
    try {
        // Try SKILL.md first (Claude/Codex format)
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        const metaJsonPath = path.join(skillPath, '_meta.json');
        let name = entryName;
        let description = '';
        let tags = [];
        if (fs.existsSync(skillMdPath)) {
            const content = fs.readFileSync(skillMdPath, 'utf-8');
            const parsed = parseFrontmatter(content);
            if (parsed.name)
                name = parsed.name;
            if (parsed.description)
                description = parsed.description;
            if (parsed.tags)
                tags = parsed.tags;
        }
        else if (fs.existsSync(metaJsonPath)) {
            // OpenClaw format
            const content = fs.readFileSync(metaJsonPath, 'utf-8');
            try {
                const meta = JSON.parse(content);
                if (meta.name)
                    name = meta.name;
                if (meta.description)
                    description = meta.description;
                if (meta.tags)
                    tags = meta.tags;
            }
            catch {
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
    }
    catch (err) {
        return null;
    }
}
function parseFrontmatter(content) {
    const result = {};
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
            }
            catch {
                // Invalid YAML, return empty
            }
        }
    }
    return result;
}
//# sourceMappingURL=scanner.js.map