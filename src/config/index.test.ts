import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { loadConfig } from './index.js';
import { join } from 'path';
import { mkdirSync, rmSync, writeFileSync } from 'fs';

describe('loadConfig', () => {
  const testDir = join(import.meta.dir, '../../.test-birdhouse-config');

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  test('throws error when config file is missing', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await expect(loadConfig()).rejects.toThrow(/Configuration not found/);
      await expect(loadConfig()).rejects.toThrow(/Run 'bh init' to create it/);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('throws error for invalid YAML', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), 'invalid: yaml: content:');
    process.chdir(testDir);

    try {
      await expect(loadConfig()).rejects.toThrow();
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('throws error for invalid config structure', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), 'version: "2"\n');
    process.chdir(testDir);

    try {
      await expect(loadConfig()).rejects.toThrow(/Invalid configuration/);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('loads valid config successfully', async () => {
    const originalCwd = process.cwd();
    mkdirSync(join(testDir, '.birdhouse'), { recursive: true });
    const validConfig = `
version: "1"
repo:
  owner: test
  name: repo
daily:
  titleFormat: "Daily - {{ date }}"
  template: daily
  labels:
    - daily
  pinned: true
schedule:
  timezone: America/Chicago
  daily: "06:00"
  rituals:
    morning: "06:00"
    workdayStartup: "09:00"
    workdayShutdown: "17:00"
    evening: "18:00"
    weeklyPreview: "18:00"
domains:
  - body
  - mind
`;
    writeFileSync(join(testDir, '.birdhouse/config.yaml'), validConfig);
    process.chdir(testDir);

    try {
      const config = await loadConfig();
      expect(config.version).toBe('1');
      expect(config.repo.owner).toBe('test');
      expect(config.repo.name).toBe('repo');
      expect(config.daily.pinned).toBe(true);
      expect(config.domains).toEqual(['body', 'mind']);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
