import { Cli, Builtins } from 'clipanion';
import { HelloCommand } from './commands/hello';

const [_node, _app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `Birdhouse`,
  binaryName: `bh`,
  binaryVersion: `1.0.0`,
  enableColors: true,
})

cli.register(Builtins.HelpCommand)
cli.register(Builtins.VersionCommand)

cli.register(HelloCommand);
cli.runExit(args);
