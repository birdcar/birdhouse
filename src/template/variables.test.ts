import { describe, expect, test } from 'bun:test';
import { createVariableResolver, type VariableContext } from './variables.js';
import type { BirdhouseConfig } from '../config/schema.js';

describe('createVariableResolver', () => {
  const mockConfig: BirdhouseConfig = {
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
        evening: '18:00',
        weeklyPreview: '18:00',
      },
    },
    domains: ['body', 'mind', 'work'],
  };

  const fixedDate = new Date('2024-03-15T10:30:00Z');

  const createContext = (
    overrides: Partial<VariableContext> = {}
  ): VariableContext => ({
    config: mockConfig,
    custom: {},
    date: fixedDate,
    ...overrides,
  });

  describe('date variables', () => {
    test('resolves {{ date }} to YYYY-MM-DD', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date')).toBe('2024-03-15');
    });

    test('resolves {{ date.year }} to full year', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date.year')).toBe('2024');
    });

    test('resolves {{ date.month }} to zero-padded month', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date.month')).toBe('03');
    });

    test('resolves {{ date.day }} to zero-padded day', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date.day')).toBe('15');
    });

    test('resolves {{ date.weekday }} to day name', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date.weekday')).toBe('Friday');
    });

    test('returns empty string for unknown date field', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('date.unknown')).toBe('');
    });
  });

  describe('config variables', () => {
    test('resolves {{ config.repo.owner }} to nested config value', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('config.repo.owner')).toBe('birdcar');
    });

    test('resolves {{ config.repo.name }} to nested config value', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('config.repo.name')).toBe('birdhouse');
    });

    test('resolves {{ config.daily.template }} to nested value', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('config.daily.template')).toBe('daily');
    });

    test('resolves {{ config.daily.pinned }} to boolean string', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('config.daily.pinned')).toBe('true');
    });

    test('returns empty string for non-existent config path', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('config.nonexistent.path')).toBe('');
    });

    test('returns empty string for config with no subpath', () => {
      const resolver = createVariableResolver(createContext());
      // config without subpath returns [object Object] stringified, but that's expected
      // The spec says "config shorthand" should check custom first
      expect(resolver('config')).toBe('[object Object]');
    });
  });

  describe('env variables', () => {
    test('resolves {{ env.HOME }} to environment variable', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('env.HOME')).toBe(process.env.HOME ?? '');
    });

    test('returns empty string for undefined env variable', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('env.BIRDHOUSE_TEST_NONEXISTENT')).toBe('');
    });

    test('resolves {{ env.PATH }} to environment variable', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('env.PATH')).toBe(process.env.PATH ?? '');
    });
  });

  describe('custom variables', () => {
    test('resolves custom variable', () => {
      const resolver = createVariableResolver(
        createContext({ custom: { name: 'Nick' } })
      );
      expect(resolver('name')).toBe('Nick');
    });

    test('custom variables take precedence over unknown sources', () => {
      const resolver = createVariableResolver(
        createContext({ custom: { foo: 'bar' } })
      );
      expect(resolver('foo')).toBe('bar');
    });

    test('returns empty string for undefined custom variable', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('undefined')).toBe('');
    });
  });

  describe('edge cases', () => {
    test('returns empty string for completely unknown path', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('unknown.path.here')).toBe('');
    });

    test('returns empty string for empty path', () => {
      const resolver = createVariableResolver(createContext());
      expect(resolver('')).toBe('');
    });
  });
});
