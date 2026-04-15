"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndexCommand = createIndexCommand;
const commander_1 = require("commander");
const scanner_1 = require("../lib/scanner");
const store_1 = require("../lib/store");
function createIndexCommand() {
    return new commander_1.Command('index')
        .description('Rebuild the skills index')
        .option('-f, --force', 'Force rebuild even if recent')
        .action(async (options) => {
        console.log('🔍 Scanning for skills...');
        const skills = await (0, scanner_1.scanSkills)();
        const index = (0, store_1.loadIndex)();
        const lastScan = index.lastScan ? new Date(index.lastScan) : null;
        const now = new Date();
        // Skip if scanned recently (within 5 minutes) unless forced
        if (lastScan && !options.force) {
            const diffMs = now.getTime() - lastScan.getTime();
            if (diffMs < 5 * 60 * 1000) {
                console.log(`Index already rebuilt at ${index.lastScan}`);
                console.log(`Use --force to rebuild anyway.`);
                return;
            }
        }
        const newIndex = {
            version: '1.0',
            lastScan: now.toISOString(),
            skills,
        };
        (0, store_1.saveIndex)(newIndex);
        console.log(`✅ Indexed ${skills.length} skills`);
        console.log(`   Last scan: ${newIndex.lastScan}`);
    });
}
//# sourceMappingURL=index.js.map