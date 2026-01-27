import { Command, Option } from 'clipanion';
import { loadConfig } from '../config/index.js';
import { renderTemplate } from '../template/index.js';
import { loadTemplate } from '../utils/templates.js';
import { getGitHubClient } from '../github/index.js';
import {
  createIssue,
  pinIssue,
  unpinIssue,
  findPinnedDailyThread,
} from '../github/issues.js';
import { logger } from '../utils/logger.js';

export class DailyCommand extends Command {
  static override paths = [['daily']];

  static override usage = Command.Usage({
    description: "Create today's Daily Thread issue",
    examples: [
      ['Create daily thread', 'bh daily'],
      ['Preview without creating', 'bh daily --dry-run'],
    ],
  });

  dryRun = Option.Boolean('--dry-run,-n', false, {
    description: 'Preview issue without creating',
  });

  async execute(): Promise<number> {
    try {
      const config = await loadConfig();
      const template = await loadTemplate(config.daily.template);

      // Render title
      const title = await renderTemplate({
        template: config.daily.titleFormat,
      });

      // Render body
      const body = await renderTemplate({ template });

      if (this.dryRun) {
        logger.info('=== DRY RUN ===\n');
        logger.info(`Title: ${title}`);
        logger.info(`Labels: ${config.daily.labels.join(', ')}`);
        logger.info('\n--- Body ---\n');
        process.stdout.write(body);
        return 0;
      }

      const client = getGitHubClient();

      // Find and unpin previous daily thread
      if (config.daily.pinned) {
        const previousPinned = await findPinnedDailyThread(
          client,
          config.daily.labels[0]
        );
        if (previousPinned) {
          logger.info(`Unpinning previous daily thread #${previousPinned}`);
          await unpinIssue(client, previousPinned);
        }
      }

      // Create new issue
      const issue = await createIssue(client, {
        title,
        body,
        labels: config.daily.labels,
      });

      logger.success(`Created Daily Thread #${issue.number}`);
      logger.info(issue.url);

      // Pin new issue
      if (config.daily.pinned) {
        await pinIssue(client, issue.number);
        logger.success('Pinned issue');
      }

      return 0;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
  }
}
