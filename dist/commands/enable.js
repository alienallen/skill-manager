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
const store_1 = require("../lib/store");
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
        // Move from disabled directory back to enabled
        const disabledPath = skill.path;
        const enabledPath = disabledPath.replace('.disabled', '');
        try {
            fs.renameSync(disabledPath, enabledPath);
            skill.path = enabledPath;
            skill.enabled = true;
            (0, store_1.saveIndex)(index);
            console.log(`✅ Enabled: ${skill.name}`);
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
        // Move to disabled directory
        const disabledPath = skill.path + '.disabled';
        try {
            fs.renameSync(skill.path, disabledPath);
            skill.path = disabledPath;
            skill.enabled = false;
            (0, store_1.saveIndex)(index);
            console.log(`✅ Disabled: ${skill.name}`);
            console.log(`   Run "skillman enable ${skillId}" to re-enable.`);
        }
        catch (err) {
            console.error(`❌ Failed to disable skill: ${err}`);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=enable.js.map