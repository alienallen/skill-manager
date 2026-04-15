import { Command } from 'commander';
import { scanSkills } from '../lib/scanner';
import { saveIndex, loadIndex } from '../lib/store';

export function createIndexCommand(): Command {
  return new Command('index')
    .description('Rebuild the skills index')
    .option('-f, --force', 'Force rebuild even if recent')
    .action(async (options) => {
      console.log('🔍 Scanning for skills...');

      const skills = await scanSkills();
      const index = loadIndex();
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

      saveIndex(newIndex);

      console.log(`✅ Indexed ${skills.length} skills`);
      console.log(`   Last scan: ${newIndex.lastScan}`);
    });
}
