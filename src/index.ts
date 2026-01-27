import { cli } from './cli.js';

const [, , ...args] = process.argv;
cli.runExit(args);
