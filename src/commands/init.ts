import { Command, Option } from 'clipanion';
import { stringify as stringifyYaml } from 'yaml';
import { defaultConfig } from '../config/defaults.js';
import { getBirdhousePath } from '../utils/paths.js';
import { logger } from '../utils/logger.js';

export class InitCommand extends Command {
  static override paths = [['init']];

  static override usage = Command.Usage({
    description: 'Initialize Birdhouse in the current repository',
    examples: [
      ['Initialize with defaults', 'bh init'],
      ['Force overwrite existing', 'bh init --force'],
    ],
  });

  force = Option.Boolean('--force,-f', false, {
    description: 'Overwrite existing .birdhouse directory',
  });

  async execute(): Promise<number> {
    // Check if already exists
    const configFile = Bun.file(getBirdhousePath('config.yaml'));
    if (await configFile.exists() && !this.force) {
      logger.error(
        `.birdhouse/ already exists. Use --force to overwrite.`
      );
      return 1;
    }

    // Create directory structure
    const dirs = ['templates', 'rituals', 'state'];
    for (const dir of dirs) {
      await Bun.write(
        getBirdhousePath(dir, '.gitkeep'),
        ''
      );
    }

    // Write config
    const configContent = stringifyYaml(defaultConfig, {
      lineWidth: 0,
    });

    const configWithComments = `# Birdhouse Configuration
# Documentation: https://github.com/birdcar/birdhouse

${configContent}`;

    await Bun.write(getBirdhousePath('config.yaml'), configWithComments);

    logger.success('Initialized Birdhouse!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('  1. Edit .birdhouse/config.yaml with your settings');
    logger.info('  2. Run "bh publish" to scaffold workflows and templates');
    logger.info('  3. Commit and push your changes');

    return 0;
  }
}
