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
exports.createEnableCommand = createEnableCommand;
exports.createDisableCommand = createDisableCommand;
const commander_1 = require("commander");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const store_1 = require("../lib/store");
function isSymlink(targetPath) {
    try {
        return fs.lstatSync(targetPath).isSymbolicLink();
    }
    catch {
        return false;
    }
}
function getRealPath(symlinkPath) {
    try {
        return fs.readlinkSync(symlinkPath);
    }
    catch {
        return symlinkPath;
    }
}
function createEnableCommand() {
    return new commander_1.Command('enable')
        .description('Enable a disabled skill')
        .argument('<skill-id>', 'Skill ID to enable')
        .action(async (skillId) => {
        const index = (0, store_1.loadIndex)();
        const skill = index.skills.find(s => s.id === skillId);
        if (!skill) {
            console.log(`❌ Skill not found: ${skillId}`);
            process.exit(1);
        }
        if (skill.enabled) {
            console.log(`✅ Skill ${skill.name} is already enabled.`);
            return;
        }
        const skillPath = skill.path;
        const isSym = isSymlink(skillPath);
        try {
            if (isSym) {
                // Handle symlink: enable the real .disabled version
                const realPath = getRealPath(skillPath);
                const disabledRealPath = realPath + '.disabled';
                const enabledRealPath = realPath.replace(new RegExp('\\.disabled$'), '');
                if (!fs.existsSync(disabledRealPath)) {
                    console.log(`❌ Disabled version not found: ${disabledRealPath}`);
                    process.exit(1);
                }
                // Rename .disabled version back
                fs.renameSync(disabledRealPath, enabledRealPath);
                // Remove old symlink and create new one pointing to enabled version
                fs.unlinkSync(skillPath);
                const relativePath = path.relative(path.dirname(skillPath), enabledRealPath);
                fs.symlinkSync(relativePath, skillPath);
                skill.path = skillPath.replace(/\.disabled$/, '');
                skill.enabled = true;
                (0, store_1.saveIndex)(index);
                console.log(`✅ Enabled: ${skill.name} (shared skill)`);
            }
            else {
                // Handle regular directory
                const enabledPath = skillPath.replace('.disabled', '');
                fs.renameSync(skillPath, enabledPath);
                skill.path = enabledPath;
                skill.enabled = true;
                (0, store_1.saveIndex)(index);
                console.log(`✅ Enabled: ${skill.name}`);
            }
        }
        catch (err) {
            console.error(`❌ Failed to enable skill: ${err}`);
            process.exit(1);
        }
    });
}
function createDisableCommand() {
    return new commander_1.Command('disable')
        .description('Disable a skill (moves to .disabled directory)')
        .argument('<skill-id>', 'Skill ID to disable')
        .action(async (skillId) => {
        const index = (0, store_1.loadIndex)();
        const skill = index.skills.find(s => s.id === skillId);
        if (!skill) {
            console.log(`❌ Skill not found: ${skillId}`);
            process.exit(1);
        }
        if (!skill.enabled) {
            console.log(`⚠️  Skill ${skill.name} is already disabled.`);
            return;
        }
        const skillPath = skill.path;
        const isSym = isSymlink(skillPath);
        try {
            if (isSym) {
                // Handle symlink: disable the real directory
                const realPath = getRealPath(skillPath);
                const skillName = path.basename(skillPath);
                const disabledRealPath = path.join(path.dirname(realPath), '.disabled', skillName);
                // Create .disabled directory if needed
                const disabledDir = path.join(path.dirname(realPath), '.disabled');
                if (!fs.existsSync(disabledDir)) {
                    fs.mkdirSync(disabledDir, { recursive: true });
                }
                // Move real directory to .disabled
                fs.renameSync(realPath, disabledRealPath);
                // Remove old symlink
                fs.unlinkSync(skillPath);
                // Create new symlink pointing to .disabled version
                const relativePath = path.relative(path.dirname(skillPath), disabledRealPath);
                fs.symlinkSync(relativePath, skillPath);
                // Update index to reflect the new symlink path (which still ends with .disabled)
                skill.enabled = false;
                (0, store_1.saveIndex)(index);
                console.log(`✅ Disabled: ${skill.name} (shared skill)`);
                console.log(`   ⚠️  This affects all tools using this shared skill.`);
            }
            else {
                // Handle regular directory
                const disabledPath = skillPath + '.disabled';
                fs.renameSync(skillPath, disabledPath);
                skill.path = disabledPath;
                skill.enabled = false;
                (0, store_1.saveIndex)(index);
                console.log(`✅ Disabled: ${skill.name}`);
            }
        }
        catch (err) {
            console.error(`❌ Failed to disable skill: ${err}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=enable.js.map