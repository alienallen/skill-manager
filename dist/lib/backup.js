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
exports.ensureTrashDir = ensureTrashDir;
exports.backupSkill = backupSkill;
exports.removeSkill = removeSkill;
exports.restoreSkill = restoreSkill;
exports.cleanExpiredTrash = cleanExpiredTrash;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const paths_1 = require("./paths");
const store_1 = require("./store");
function ensureTrashDir() {
    if (!fs.existsSync(paths_1.TRASH_DIR)) {
        fs.mkdirSync(paths_1.TRASH_DIR, { recursive: true });
    }
}
function backupSkill(skillPath, skillId, skillName) {
    ensureTrashDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${skillId.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}`;
    const backupPath = path.join(paths_1.TRASH_DIR, backupName);
    try {
        // Use cp -r to preserve all attributes and contents
        (0, child_process_1.execSync)(`cp -r "${skillPath}" "${backupPath}"`, { stdio: 'pipe' });
    }
    catch (err) {
        throw new Error(`Failed to backup skill: ${err}`);
    }
    return backupPath;
}
function removeSkill(skillPath, skillId, skillName, force = false) {
    // Check for symlink references
    const targets = (0, paths_1.getSymlinkTargets)(skillPath);
    const isSharedSkill = targets.length > 0;
    if (isSharedSkill && !force) {
        console.log(`⚠️  This skill is shared and referenced by: ${targets.join(', ')}`);
        console.log(`   Deleting it may affect other tools. Use --force to override.`);
        process.exit(1);
    }
    // Create backup
    const backupPath = backupSkill(skillPath, skillId, skillName);
    // Remove original
    try {
        fs.rmSync(skillPath, { recursive: true, force: true });
    }
    catch (err) {
        throw new Error(`Failed to remove skill: ${err}`);
    }
    // Update index to remove the skill
    const index = (0, store_1.loadIndex)();
    index.skills = index.skills.filter(s => s.id !== skillId);
    (0, store_1.saveIndex)(index);
    // Record operation with original path
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
    const operation = {
        id: `op-${Date.now()}`,
        type: 'remove',
        skillId,
        skillName,
        originalPath: skillPath,
        backupPath,
        timestamp: new Date().toISOString(),
        expiresAt,
    };
    (0, store_1.addOperation)(operation);
    console.log(`✅ Removed: ${skillName}`);
    console.log(`   Backup location: ${backupPath}`);
    console.log(`   Run 'skillman restore ${skillId}' to undo`);
}
function restoreSkill(skillId) {
    const operations = (0, store_1.loadOperations)().filter(op => op.skillId === skillId && op.type === 'remove');
    if (operations.length === 0) {
        console.log(`❌ No removal operation found for ${skillId}`);
        process.exit(1);
    }
    const latestOp = operations[0];
    const backupPath = latestOp.backupPath;
    const originalPath = latestOp.originalPath;
    if (!fs.existsSync(backupPath)) {
        console.log(`❌ Backup not found: ${backupPath}`);
        console.log(`   The backup may have expired or been manually deleted.`);
        process.exit(1);
    }
    // Restore to original path
    try {
        fs.mkdirSync(path.dirname(originalPath), { recursive: true });
        (0, child_process_1.execSync)(`cp -r "${backupPath}" "${originalPath}"`, { stdio: 'pipe' });
    }
    catch (err) {
        throw new Error(`Failed to restore skill: ${err}`);
    }
    console.log(`✅ Restored: ${latestOp.skillName}`);
    console.log(`   Location: ${originalPath}`);
    // Remove the operation since it was undone
    const allOps = (0, store_1.loadOperations)();
    const updatedOps = allOps.filter(op => op.id !== latestOp.id);
    (0, store_1.saveOperations)(updatedOps);
}
function cleanExpiredTrash() {
    ensureTrashDir();
    const operations = (0, store_1.loadOperations)();
    const now = Date.now();
    let cleaned = 0;
    for (const op of operations) {
        if (op.expiresAt && new Date(op.expiresAt).getTime() < now) {
            if (fs.existsSync(op.backupPath)) {
                try {
                    fs.rmSync(op.backupPath, { recursive: true, force: true });
                    cleaned++;
                }
                catch {
                    // Ignore cleanup errors
                }
            }
        }
    }
    return cleaned;
}
//# sourceMappingURL=backup.js.map