import { Command } from "clipanion";
import * as core from '@actions/core'
import { readFileSync, existsSync } from 'node:fs'

export interface BirdhouseConfig {
  variables?: {
    [key: string]: any
  },
  [key: string]: any
}

export abstract class BaseCommand extends Command {
  core = core;
  config: BirdhouseConfig = {};

  constructor() {
    super()

    // Load config file on initialization
    const configFilePath = `${process.cwd()}/.birdhouse/config.json`

    if (existsSync(configFilePath)) {
      this.config = JSON.parse(readFileSync(configFilePath, { encoding: "utf-8" }))
    } else {
      core.debug('Config file not found, skipping...')
    }
  }

  abstract execute(): Promise<number | void>;
}
