import { Cli, Builtins } from 'clipanion';
import { HelloCommand } from './commands/hello';
import { GenerateCommand } from './commands/generate';
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
cli.register(GenerateCommand)
cli.runExit(args);
