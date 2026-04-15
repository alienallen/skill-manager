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
exports.SKILL_PATHS = exports.OPERATIONS_FILE = exports.INDEX_FILE = exports.TRASH_DIR = exports.SKILL_MANAGER_DIR = exports.HOME = void 0;
exports.getSymlinkTargets = getSymlinkTargets;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
exports.HOME = os.homedir();
exports.SKILL_MANAGER_DIR = path.join(exports.HOME, '.skill-manager');
exports.TRASH_DIR = path.join(exports.SKILL_MANAGER_DIR, 'trash');
exports.INDEX_FILE = path.join(exports.SKILL_MANAGER_DIR, 'index.json');
exports.OPERATIONS_FILE = path.join(exports.SKILL_MANAGER_DIR, 'operations.json');
// Skill source paths
exports.SKILL_PATHS = {
    claude: path.join(exports.HOME, '.claude', 'skills'),
    codex: path.join(exports.HOME, '.codex', 'skills'),
    openclaw: path.join(exports.HOME, '.openclaw', 'skills'),
    agents: path.join(exports.HOME, '.agents', 'skills'),
};
function getSymlinkTargets(skillPath) {
    const targets = [];
    for (const [source, dir] of Object.entries(exports.SKILL_PATHS)) {
        if (dir === skillPath)
            continue;
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
        }
        catch {
            // Directory doesn't exist or not accessible
        }
    }
    return targets;
}
//# sourceMappingURL=paths.js.map