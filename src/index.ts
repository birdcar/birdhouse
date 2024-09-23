import { Command, Option, Cli } from 'clipanion';

export class HelloCommand extends Command {
  name = Option.String();

  async execute() {
    this.context.stdout.write(`Hello ${this.name}!\n`);
  }
}

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `My Application`,
  binaryName: `${node} ${app}`,
  binaryVersion: `1.0.0`,
})

cli.register(HelloCommand);
cli.runExit(args);
