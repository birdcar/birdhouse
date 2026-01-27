import { Command, Option } from 'clipanion';
import { join, dirname } from 'path';
import { mkdir } from 'fs/promises';
import {
  PUBLISHABLE_ASSETS,
  getAssetContent,
  filterAssets,
  type PublishableAsset,
} from '../publish/index.js';
import { loadConfig } from '../config/index.js';
import { getRepoRoot } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

export class PublishCommand extends Command {
  static override paths = [['publish']];

  static override usage = Command.Usage({
    description:
      'Publish workflows, templates, and domain folders to your repo',
    examples: [
      ['Publish everything', 'bh publish'],
      ['List what would be published', 'bh publish --list'],
      ['Publish workflows only', 'bh publish --workflows-only'],
      ['Publish templates only', 'bh publish --templates-only'],
      ['Force overwrite existing', 'bh publish --force'],
      ['Publish and commit', 'bh publish --commit'],
    ],
  });

  list = Option.Boolean('--list,-l', false, {
    description: 'List assets that would be published',
  });

  workflowsOnly = Option.Boolean('--workflows-only', false, {
    description: 'Only publish workflow files',
  });

  templatesOnly = Option.Boolean('--templates-only', false, {
    description: 'Only publish template files',
  });

  domainsOnly = Option.Boolean('--domains-only', false, {
    description: 'Only publish domain folders',
  });

  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing files without prompting',
  });

  commit = Option.Boolean('--commit,-c', false, {
    description: 'Commit published files',
  });

  async execute(): Promise<number> {
    const config = await loadConfig();
    const assets = filterAssets(PUBLISHABLE_ASSETS, {
      workflows: this.workflowsOnly,
      templates: this.templatesOnly,
      domains: this.domainsOnly,
    });

    if (this.list) {
      logger.info('Assets to publish:\n');

      const byCategory = new Map<string, PublishableAsset[]>();
      for (const asset of assets) {
        const list = byCategory.get(asset.category) ?? [];
        list.push(asset);
        byCategory.set(asset.category, list);
      }

      for (const [category, categoryAssets] of byCategory) {
        logger.info(`${category}:`);
        for (const asset of categoryAssets) {
          logger.info(`  ${asset.destination}`);
        }
        logger.info('');
      }
      return 0;
    }

    const repoRoot = getRepoRoot();
    const published: string[] = [];
    const skipped: string[] = [];

    for (const asset of assets) {
      const destPath = join(repoRoot, asset.destination);
      const exists = await Bun.file(destPath).exists();

      if (exists && !this.force) {
        skipped.push(asset.destination);
        continue;
      }

      // Ensure directory exists
      const dir = dirname(destPath);
      await mkdir(dir, { recursive: true });

      const content = await getAssetContent(asset, config);
      await Bun.write(destPath, content);
      published.push(asset.destination);
    }

    if (published.length > 0) {
      logger.success(`Published ${published.length} files:`);
      for (const p of published) {
        logger.info(`  ${p}`);
      }
    }

    if (skipped.length > 0) {
      logger.warn(
        `\nSkipped ${skipped.length} existing files (use --force to overwrite):`
      );
      for (const s of skipped) {
        logger.info(`  ${s}`);
      }
    }

    if (this.commit && published.length > 0) {
      const { commitFiles } = await import('../git/index.js');
      await commitFiles(published, 'chore: publish birdhouse scaffold');
      logger.success('\nCommitted changes');
    }

    return 0;
  }
}
