import { Command } from 'commander';
import { loadIndex } from '../lib/store';
import { formatList } from '../lib/format';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all installed skills')
    .option('--source <source>', 'Filter by source (claude, codex, openclaw, agents)')
    .option('--claude', 'Only list Claude Code skills')
    .option('--codex', 'Only list Codex skills')
    .option('--openclaw', 'Only list OpenClaw skills')
    .option('--agents', 'Only list shared/agents skills')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      // Map shorthand options to source
      if (options.claude) options.source = 'claude';
      if (options.codex) options.source = 'codex';
      if (options.openclaw) options.source = 'openclaw';
      if (options.agents) options.source = 'agents';

      const index = loadIndex();
      if (index.skills.length === 0) {
        console.log('No skills indexed. Run "skillman index" first.');
        return;
      }
      formatList(index.skills, options);
    });
}
