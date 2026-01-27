import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { cli } from '../cli.js';

describe('InitCommand', () => {
  const testDir = join(import.meta.dir, '../../.test-birdhouse-init');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test('creates .birdhouse directory structure', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const exitCode = await cli.run(['init']);

      expect(exitCode).toBe(0);
      expect(existsSync(join(testDir, '.birdhouse/config.yaml'))).toBe(true);
      expect(existsSync(join(testDir, '.birdhouse/templates/.gitkeep'))).toBe(true);
      expect(existsSync(join(testDir, '.birdhouse/rituals/.gitkeep'))).toBe(true);
      expect(existsSync(join(testDir, '.birdhouse/state/.gitkeep'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('config file has documentation header', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await cli.run(['init']);

      const configContent = readFileSync(join(testDir, '.birdhouse/config.yaml'), 'utf-8');
      expect(configContent).toContain('# Birdhouse Configuration');
      expect(configContent).toContain('# Documentation:');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('config file contains default values', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await cli.run(['init']);

      const configContent = readFileSync(join(testDir, '.birdhouse/config.yaml'), 'utf-8');
      expect(configContent).toContain('version: "1"');
      expect(configContent).toContain('daily-thread');
      expect(configContent).toContain('pinned: true');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('fails when .birdhouse already exists without --force', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), 'existing: true');
    process.chdir(testDir);

    try {
      const exitCode = await cli.run(['init']);

      expect(exitCode).toBe(1);
      const configContent = readFileSync(join(testDir, '.birdhouse/config.yaml'), 'utf-8');
      expect(configContent).toBe('existing: true');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('overwrites when --force is used', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), 'existing: true');
    process.chdir(testDir);

    try {
      const exitCode = await cli.run(['init', '--force']);

      expect(exitCode).toBe(0);
      const configContent = readFileSync(join(testDir, '.birdhouse/config.yaml'), 'utf-8');
      expect(configContent).toContain('version: "1"');
      expect(configContent).not.toContain('existing: true');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('overwrites when -f shorthand is used', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), 'existing: true');
    process.chdir(testDir);

    try {
      const exitCode = await cli.run(['init', '-f']);

      expect(exitCode).toBe(0);
      const configContent = readFileSync(join(testDir, '.birdhouse/config.yaml'), 'utf-8');
      expect(configContent).toContain('version: "1"');
    } finally {
      process.chdir(originalCwd);
    }
  });
});
