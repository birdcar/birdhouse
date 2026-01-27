import { describe, expect, test } from 'bun:test';
import { configSchema, type BirdhouseConfig } from './schema.js';

describe('configSchema', () => {
  const validConfig: BirdhouseConfig = {
    version: '1',
    repo: {
      owner: 'birdcar',
      name: 'birdhouse',
    },
    daily: {
      titleFormat: 'Daily Thread - {{ date }}',
      template: 'daily',
      labels: ['daily-thread'],
      pinned: true,
    },
    schedule: {
      timezone: 'America/Chicago',
      daily: '06:00',
      rituals: {
        morning: '06:00',
        workdayStartup: '09:00',
        workdayShutdown: '17:00',
        evening: '18:00',
        weeklyPreview: '18:00',
      },
    },
    domains: ['body', 'mind', 'work'],
  };

  test('accepts valid configuration', () => {
    const errors: string[] = [];
    expect(configSchema(validConfig, { errors })).toBe(true);
    expect(errors).toHaveLength(0);
  });

  test('rejects missing version field', () => {
    const config = { ...validConfig, version: undefined };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects invalid version value', () => {
    const config = { ...validConfig, version: '2' };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects missing repo field', () => {
    const config = { ...validConfig, repo: undefined };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects missing repo.owner', () => {
    const config = { ...validConfig, repo: { name: 'test' } };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects non-string repo.owner', () => {
    const config = { ...validConfig, repo: { owner: 123, name: 'test' } };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects missing daily field', () => {
    const config = { ...validConfig, daily: undefined };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects non-boolean daily.pinned', () => {
    const config = {
      ...validConfig,
      daily: { ...validConfig.daily, pinned: 'yes' },
    };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects non-array daily.labels', () => {
    const config = {
      ...validConfig,
      daily: { ...validConfig.daily, labels: 'label' },
    };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects non-string items in daily.labels', () => {
    const config = {
      ...validConfig,
      daily: { ...validConfig.daily, labels: [123] },
    };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('rejects non-array domains', () => {
    const config = { ...validConfig, domains: 'body' };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(false);
  });

  test('accepts empty domains array', () => {
    const config = { ...validConfig, domains: [] };
    const errors: string[] = [];
    expect(configSchema(config, { errors })).toBe(true);
  });

  test('rejects null input', () => {
    const errors: string[] = [];
    expect(configSchema(null, { errors })).toBe(false);
  });

  test('rejects non-object input', () => {
    const errors: string[] = [];
    expect(configSchema('not an object', { errors })).toBe(false);
  });
});
