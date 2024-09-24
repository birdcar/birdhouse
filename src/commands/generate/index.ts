import { Command, Option } from 'clipanion'
import { BaseCommand } from '../../utils/baseCommand';
import { loadTemplate } from './templates';
import * as path from "node:path"
import { exists } from "node:fs/promises"
import * as io from "@actions/io"

export class GenerateCommand extends BaseCommand {
  static paths = [[`generate`], [`g`]]

  outputPaths = Option.Rest();
  templateName = Option.String(`-t,--template`,)
  #template = ""

  static usage = Command.Usage({
    category: `creation`,
    description: `Generate a file, optionally from a template`,
    details: `
      This automates generating a file in an arbitrarily nested folder in your repository.

      You can specify a template with the -t/--template flag. Templates support all default nunjucks tags, and we'll look for template files in the '.birdhouse/templates' directory by name+extention. (e.g. in .birdcar/templates you can place a template called 'journal.md', and then you can use that template by passing '-t journal.md').

      The entire GitHub Actions environment is loaded into template context as so:

      - env: the raw shell environment, sans GitHub specific variables

      - gh: Any GitHub specific default variables (c.f. https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#default-environment-variables)

      - payload: the payload for the specific action (c.f. https://docs.github.com/en/webhooks/webhook-events-and-payloads)

      - config: Any values in the optional birdhouse config file located at .birdhouse/config.json
    `,
    examples: [
      ["Generate a file", "$0 {generate,g} path/to/file.ext"],
      ["Generate a file from a template located at .birdhouse/templates/journal.md", "$0 {generate,g} path/to/file.ext --template=journal.md"],
    ]
  })

  async execute() {

    if (this.templateName) {
      this.#template = loadTemplate(this.templateName, this.config);
    }

    for (const fp of this.outputPaths) {
      let dir = path.dirname(fp)

      if (!(await exists(dir))) {
        await io.mkdirP(dir)
      }

      this.context.stdout.write(`Generateing a file at ${fp}!\n`);
      Bun.write(fp, this.#template)
    }
  }
}
