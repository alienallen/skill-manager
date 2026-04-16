"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatList = formatList;
exports.formatSkillDetail = formatSkillDetail;
const SOURCE_ICONS = {
    claude: '🔵',
    codex: '🟢',
    openclaw: '🟠',
    agents: '⚪',
};
const SOURCE_LABELS = {
    claude: 'Claude Code',
    codex: 'Codex',
    openclaw: 'OpenClaw',
    agents: 'Shared',
};
function formatList(skills, options) {
    // Filter by source if specified
    let filtered = skills;
    if (options.source) {
        filtered = skills.filter(s => s.source === options.source);
    }
    if (options.json) {
        console.log(JSON.stringify(filtered, null, 2));
        return;
    }
    if (filtered.length === 0) {
        console.log('No skills found.');
        return;
    }
    // Group by source
    const grouped = {};
    for (const skill of filtered) {
        if (!grouped[skill.source]) {
            grouped[skill.source] = [];
        }
        grouped[skill.source].push(skill);
    }
    console.log(`\n📦 Your AI Skills (${filtered.length} total)\n`);
    for (const [source, sourceSkills] of Object.entries(grouped)) {
        const icon = SOURCE_ICONS[source] || '⚪';
        const label = SOURCE_LABELS[source] || source;
        console.log(`\n${icon} ${label} (${sourceSkills.length})`);
        console.log('─'.repeat(60));
        for (const skill of sourceSkills) {
            const symlinkMarker = skill.isSymlink ? ' 🔗' : '';
            const disabledMarker = !skill.enabled ? ' [disabled]' : '';
            const name = skill.name || skill.id.split(':')[1];
            const desc = skill.description ? truncate(skill.description, 45) : '';
            console.log(`  ${name}${symlinkMarker}${disabledMarker}  [${skill.id}]  ${desc}`);
        }
    }
    console.log('');
}
function truncate(str, maxLen) {
    if (str.length <= maxLen)
        return str;
    return str.slice(0, maxLen - 1) + '…';
}
function formatSkillDetail(skill) {
    console.log(`\n${skill.name || skill.id}`);
    console.log('─'.repeat(50));
    console.log(`ID:       ${skill.id}`);
    console.log(`Source:   ${SOURCE_LABELS[skill.source] || skill.source}`);
    console.log(`Path:     ${skill.path}`);
    console.log(`Enabled:  ${skill.enabled ? 'Yes' : 'No'}`);
    console.log(`Symlink:  ${skill.isSymlink ? 'Yes' : 'No'}`);
    if (skill.tags.length > 0) {
        console.log(`Tags:     ${skill.tags.join(', ')}`);
    }
    if (skill.description) {
        console.log(`\nDescription:\n${skill.description}`);
    }
}
//# sourceMappingURL=format.js.map