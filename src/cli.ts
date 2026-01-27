import { Builtins, Cli } from 'clipanion';
import { InitCommand } from './commands/init.js';
import { RenderCommand } from './commands/render.js';
import { DailyCommand } from './commands/daily.js';
import { PublishCommand } from './commands/publish.js';

const cli = new Cli({
  binaryLabel: 'Birdhouse',
  binaryName: 'bh',
  binaryVersion: process.env.npm_package_version ?? '0.0.0',
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
cli.register(InitCommand);
cli.register(RenderCommand);
cli.register(DailyCommand);
cli.register(PublishCommand);

export { cli };
