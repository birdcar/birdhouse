import { Command, Option } from 'clipanion';
import { renderTemplate } from '../template/index.js';
import { loadTemplate, listTemplates } from '../utils/templates.js';
import { logger } from '../utils/logger.js';

export class RenderCommand extends Command {
  static override paths = [['render']];

  static override usage = Command.Usage({
    description: 'Render a template from .birdhouse/templates/',
    examples: [
      ['Render daily template', 'bh render daily'],
      ['Render with output file', 'bh render daily --output today.md'],
      ['Render with custom variables', 'bh render daily --var name=Nick'],
      ['List available templates', 'bh render --list'],
    ],
  });

  template = Option.String({ required: false });

  list = Option.Boolean('--list,-l', false, {
    description: 'List available templates',
  });

  output = Option.String('--output,-o', {
    description: 'Write output to file instead of stdout',
  });

  variables = Option.Array('--var,-v', {
    description: 'Custom variable (key=value)',
  });

  async execute(): Promise<number> {
    if (this.list) {
      const templates = await listTemplates();
      if (templates.length === 0) {
        logger.info('No templates found in .birdhouse/templates/');
        logger.info('Create a template: .birdhouse/templates/daily.md');
      } else {
        logger.info('Available templates:');
        for (const t of templates) {
          logger.info(`  ${t}`);
        }
      }
      return 0;
    }

    if (!this.template) {
      logger.error(
        'Template name required. Use --list to see available templates.'
      );
      return 1;
    }

    // Parse custom variables
    const customVariables: Record<string, string> = {};
    for (const v of this.variables ?? []) {
      const [key, ...valueParts] = v.split('=');
      if (!key || valueParts.length === 0) {
        logger.error(`Invalid variable format: ${v}. Use key=value`);
        return 1;
      }
      customVariables[key] = valueParts.join('='); // Allow = in values
    }

    try {
      const templateContent = await loadTemplate(this.template);
      const rendered = await renderTemplate({
        template: templateContent,
        customVariables,
      });

      if (this.output) {
        await Bun.write(this.output, rendered);
        logger.success(`Rendered to ${this.output}`);
      } else {
        // Output to stdout without extra formatting
        process.stdout.write(rendered);
      }

      return 0;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      return 1;
    }
  }
}
