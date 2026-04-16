"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemoveCommand = createRemoveCommand;
const commander_1 = require("commander");
const store_1 = require("../lib/store");
const backup_1 = require("../lib/backup");
async function promptConfirm(message) {
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve(true);
            return;
        }
        console.log(`\n${message}`);
        console.log('Press Enter to confirm or Ctrl+C to cancel...');
        process.stdin.once('data', () => {
            resolve(true);
        });
    });
}
async function selectSkill(skills) {
    if (skills.length === 0)
        return null;
    console.log('\nMultiple skills found with this name. Which one to remove?\n');
    skills.forEach((skill, i) => {
        console.log(`  ${i + 1}. ${skill.name} (${skill.id})`);
        console.log(`     Source: ${skill.source}`);
        console.log(`     Path: ${skill.path}`);
        if (skill.description) {
            console.log(`     ${skill.description.slice(0, 50)}...`);
        }
        console.log('');
    });
    return new Promise((resolve) => {
        if (!process.stdin.isTTY) {
            resolve(skills[0]);
            return;
        }
        console.log('Enter number (or Ctrl+C to cancel): ');
        process.stdin.once('data', (data) => {
            const num = parseInt(data.toString().trim(), 10);
            if (num >= 1 && num <= skills.length) {
                resolve(skills[num - 1]);
            }
            else {
                resolve(null);
            }
        });
    });
}
function createRemoveCommand() {
    return new commander_1.Command('remove')
        .description('Remove a skill (with backup)')
        .argument('<skill-id-or-name>', 'Skill ID (e.g., claude:code-review) or name')
        .option('-f, --force', 'Skip safety checks for confirmation')
        .action(async (skillIdOrName, options) => {
        const index = (0, store_1.loadIndex)();
        // Try to find by exact ID first
        let skill = index.skills.find(s => s.id === skillIdOrName);
        let matchedBy = 'ID';
        // If not found by ID, try to find by name
        if (!skill) {
            const nameMatches = index.skills.filter(s => s.name.toLowerCase() === skillIdOrName.toLowerCase());
            if (nameMatches.length === 0) {
                // Partial match as fallback
                const partialMatches = index.skills.filter(s => s.name.toLowerCase().includes(skillIdOrName.toLowerCase()));
                if (partialMatches.length === 1) {
                    skill = partialMatches[0];
                    matchedBy = 'name (partial match)';
                }
                else if (partialMatches.length > 1) {
                    console.log(`\n❌ Multiple skills match "${skillIdOrName}":\n`);
                    partialMatches.forEach((s, i) => {
                        console.log(`  ${i + 1}. ${s.name} (${s.id})`);
                    });
                    const selected = await selectSkill(partialMatches);
                    if (!selected) {
                        console.log('Cancelled.');
                        process.exit(0);
                    }
                    skill = selected;
                    matchedBy = 'name';
                }
            }
            else if (nameMatches.length === 1) {
                skill = nameMatches[0];
                matchedBy = 'name';
            }
            else {
                // Multiple exact name matches
                const selected = await selectSkill(nameMatches);
                if (!selected) {
                    console.log('Cancelled.');
                    process.exit(0);
                }
                skill = selected;
                matchedBy = 'name';
            }
        }
        if (!skill) {
            console.log(`❌ Skill not found: ${skillIdOrName}`);
            console.log(`   Run "skillman list" to see available skills.`);
            process.exit(1);
        }
        console.log(`\n🔍 Found by ${matchedBy}: ${skill.name} (${skill.id})`);
        // Show warning for shared skills
        if (skill.isSymlink) {
            console.log(`   ⚠️  This is a symlink.`);
        }
        // Confirm unless forced
        if (!options.force) {
            const confirmed = await promptConfirm(`⚠️  About to remove: ${skill.name}\n   Source: ${skill.source}\n   Path: ${skill.path}\n\n   This will backup the skill before removal.\n   You can restore it with "skillman restore ${skill.id}"`);
            if (!confirmed) {
                console.log('Cancelled.');
                process.exit(0);
            }
        }
        (0, backup_1.removeSkill)(skill.path, skill.id, skill.name, options.force);
        process.exit(0);
    });
}
//# sourceMappingURL=remove.js.map