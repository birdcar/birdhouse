import { Builtins, Cli } from 'clipanion';
import { InitCommand } from './commands/init.js';
import { RenderCommand } from './commands/render.js';
import { DailyCommand } from './commands/daily.js';
import { PublishCommand } from './commands/publish.js';
import { MigrateCommand } from './commands/migrate.js';
import pkg from '../package.json' with { type: 'json' };

const cli = new Cli({
  binaryLabel: 'Birdhouse',
  binaryName: 'bh',
  binaryVersion: pkg.version,
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
cli.register(InitCommand);
cli.register(RenderCommand);
cli.register(DailyCommand);
cli.register(PublishCommand);
cli.register(MigrateCommand);

export { cli };
