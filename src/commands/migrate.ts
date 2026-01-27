import { Command, Option } from 'clipanion';
import { loadConfig } from '../config/index.js';
import { getGitHubClient, type GitHubClient } from '../github/index.js';
import { getIssue, updateIssue, findPinnedDailyThread } from '../github/issues.js';
import {
  extractTasks,
  filterMigratableTasks,
  sortTasksByPriority,
  tasksToMarkdown,
} from '../tasks/index.js';
import { logger } from '../utils/logger.js';
import { getBirdhousePath } from '../utils/paths.js';

export class MigrateCommand extends Command {
  static override paths = [['migrate']];

  static override usage = Command.Usage({
    description: 'Migrate incomplete tasks from closed Daily Thread to current',
    examples: [
      ['Migrate from most recently closed', 'bh migrate'],
      ['Migrate from specific issue', 'bh migrate --from 123'],
      ['Preview without migrating', 'bh migrate --dry-run'],
    ],
  });

  from = Option.String('--from', {
    description: 'Source issue number to migrate from',
  });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Preview migration without making changes',
  });

  token = Option.String('--token,-t', {
    description: 'GitHub token (default: from gh CLI or GITHUB_TOKEN)',
  });

  repo = Option.String('--repo,-r', {
    description: 'Target repository (owner/repo format)',
  });

  noPrompt = Option.Boolean('--no-prompt', false, {
    description: 'Disable interactive credential prompts',
  });

  async execute(): Promise<number> {
    try {
      const config = await loadConfig();
      const client = await getGitHubClient({
        token: this.token,
        repo: this.repo,
        noPrompt: this.noPrompt,
      });
      const dailyLabel = config.daily.labels[0]!;

      // Find source issue
      let sourceIssueNumber: number;

      if (this.from) {
        sourceIssueNumber = parseInt(this.from, 10);
      } else {
        // Find most recently closed daily thread
        const closed = await findRecentlyClosedDailyThread(client, dailyLabel);
        if (!closed) {
          logger.error('No recently closed Daily Thread found');
          return 1;
        }
        sourceIssueNumber = closed;
      }

      // Find current (target) daily thread
      const targetIssueNumber = await findPinnedDailyThread(client, dailyLabel);
      if (!targetIssueNumber) {
        logger.error('No open Daily Thread found. Run "bh daily" first.');
        return 1;
      }

      if (sourceIssueNumber === targetIssueNumber) {
        logger.error('Source and target issues are the same');
        return 1;
      }

      // Get source issue body
      const sourceIssue = await getIssue(client, sourceIssueNumber);

      // Extract and filter tasks
      const allTasks = await extractTasks(sourceIssue.body ?? '');
      const migratableTasks = filterMigratableTasks(allTasks);
      const sortedTasks = sortTasksByPriority(migratableTasks);

      if (sortedTasks.length === 0) {
        logger.success('No tasks to migrate');
        return 0;
      }

      const migratedMarkdown = tasksToMarkdown(sortedTasks, true);

      if (this.dryRun) {
        logger.info(`=== DRY RUN ===`);
        logger.info(`\nFrom: #${sourceIssueNumber}`);
        logger.info(`To: #${targetIssueNumber}`);
        logger.info(`\nTasks to migrate (${sortedTasks.length}):\n`);
        process.stdout.write(migratedMarkdown);
        logger.info('\n');
        return 0;
      }

      // Get target issue and append tasks
      const targetIssue = await getIssue(client, targetIssueNumber);
      const updatedBody = `${targetIssue.body}\n\n## Migrated Tasks\n\n${migratedMarkdown}`;

      await updateIssue(client, targetIssueNumber, { body: updatedBody });

      logger.success(`Migrated ${sortedTasks.length} tasks from #${sourceIssueNumber} to #${targetIssueNumber}`);

      // Log migration to state file
      await logMigration(sourceIssueNumber, targetIssueNumber, sortedTasks.length);

      return 0;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
  }
}

async function findRecentlyClosedDailyThread(
  client: GitHubClient,
  label: string
): Promise<number | null> {
  const { data: issues } = await client.octokit.rest.issues.listForRepo({
    owner: client.owner,
    repo: client.repo,
    labels: label,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 1,
  });

  return issues[0]?.number ?? null;
}

async function logMigration(
  from: number,
  to: number,
  count: number
): Promise<void> {
  const statePath = getBirdhousePath('state', 'migrations.csv');
  const line = `${new Date().toISOString()},${from},${to},${count}\n`;

  const file = Bun.file(statePath);
  const existing = await file.exists() ? await file.text() : 'timestamp,from_issue,to_issue,task_count\n';

  // Ensure state directory exists
  const stateDir = getBirdhousePath('state');
  await Bun.write(stateDir + '/.gitkeep', '');

  await Bun.write(statePath, existing + line);
}
