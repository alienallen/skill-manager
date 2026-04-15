import { Command } from 'commander';
import { loadIndex } from '../lib/store';
import { formatList } from '../lib/format';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all installed skills')
    .option('--source <source>', 'Filter by source (claude, codex, openclaw, agents)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      const index = loadIndex();
      if (index.skills.length === 0) {
        console.log('No skills indexed. Run "skillman index" first.');
        return;
      }
      formatList(index.skills, options);
    });
}
