import { describe, expect, test } from 'bun:test';
import { cli } from '../src/cli.js';

describe('CLI', () => {
  test('shows help with --help flag', async () => {
    const exitCode = await cli.run(['--help']);
    expect(exitCode).toBe(0);
  });

  test('shows version with --version flag', async () => {
    const exitCode = await cli.run(['--version']);
    expect(exitCode).toBe(0);
  });

  test('returns error for unknown command', async () => {
    const exitCode = await cli.run(['unknown-command']);
    expect(exitCode).toBe(1);
  });

  test('shows help for init command', async () => {
    const exitCode = await cli.run(['init', '--help']);
    expect(exitCode).toBe(0);
  });
});
