import { Command, Option } from 'clipanion'
import { BaseCommand } from '../utils/baseCommand';

export class HelloCommand extends BaseCommand {
  static paths = [["hello"]]
  name = Option.String();

  static usage = Command.Usage({
    category: `test`,
    description: `A quick "hello world" to check if the CLI works simply`,
    details: `
      Sometimes, when you're building something, you wanna be able to test it in practice.

      This is the hello world script that lets you do that.
    `,
    examples: [
      ["Say 'Hello world!'", "$0 hello world"],
      ["Say 'Hello Nick!'", "$0 hello Nick"],
    ]
  })

  async execute() {
    this.context.stdout.write(`Hello ${this.name}!\n`);
  }
}
