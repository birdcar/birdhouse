import { Builtins, Cli } from 'clipanion';
import { InitCommand } from './commands/init.js';

const cli = new Cli({
  binaryLabel: 'Birdhouse',
  binaryName: 'bh',
  binaryVersion: process.env.npm_package_version ?? '0.0.0',
});

cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
cli.register(InitCommand);

export { cli };
