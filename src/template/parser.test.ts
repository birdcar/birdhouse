import { describe, expect, test } from 'bun:test';
import { extractVariables, replaceVariables } from './parser.js';

describe('extractVariables', () => {
  test('extracts single variable', () => {
    const matches = extractVariables('Hello {{ name }}!');
    expect(matches).toHaveLength(1);
    expect(matches[0]).toEqual({
      match: '{{ name }}',
      path: 'name',
      start: 6,
      end: 16,
    });
  });

  test('extracts multiple variables', () => {
    const matches = extractVariables('{{ greeting }}, {{ name }}!');
    expect(matches).toHaveLength(2);
    expect(matches[0]?.path).toBe('greeting');
    expect(matches[1]?.path).toBe('name');
  });

  test('extracts dotted variable paths', () => {
    const matches = extractVariables('Owner: {{ config.repo.owner }}');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('config.repo.owner');
  });

  test('handles no whitespace inside braces', () => {
    const matches = extractVariables('Hello {{name}}!');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('name');
  });

  test('handles extra whitespace inside braces', () => {
    const matches = extractVariables('Hello {{  name  }}!');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('name');
  });

  test('returns empty array for no variables', () => {
    const matches = extractVariables('Hello World!');
    expect(matches).toHaveLength(0);
  });

  test('handles underscores in variable names', () => {
    const matches = extractVariables('{{ my_variable }}');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('my_variable');
  });

  test('handles variables starting with underscore', () => {
    const matches = extractVariables('{{ _private }}');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('_private');
  });

  test('ignores malformed braces - single brace', () => {
    const matches = extractVariables('Hello { name }!');
    expect(matches).toHaveLength(0);
  });

  test('ignores malformed braces - triple brace', () => {
    const matches = extractVariables('Hello {{{ name }}}!');
    // The regex will match the inner {{ name }}
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('name');
  });

  test('handles multiple occurrences of same variable', () => {
    const matches = extractVariables('{{ name }} - {{ name }}');
    expect(matches).toHaveLength(2);
    expect(matches[0]?.path).toBe('name');
    expect(matches[1]?.path).toBe('name');
  });

  test('rejects variables starting with number', () => {
    const matches = extractVariables('{{ 123var }}');
    expect(matches).toHaveLength(0);
  });

  test('allows numbers in variable names after first char', () => {
    const matches = extractVariables('{{ var123 }}');
    expect(matches).toHaveLength(1);
    expect(matches[0]?.path).toBe('var123');
  });
});

describe('replaceVariables', () => {
  test('replaces single variable', () => {
    const result = replaceVariables('Hello {{ name }}!', (path) =>
      path === 'name' ? 'World' : ''
    );
    expect(result).toBe('Hello World!');
  });

  test('replaces multiple variables', () => {
    const values: Record<string, string> = {
      greeting: 'Hello',
      name: 'World',
    };
    const result = replaceVariables(
      '{{ greeting }}, {{ name }}!',
      (path) => values[path] ?? ''
    );
    expect(result).toBe('Hello, World!');
  });

  test('replaces dotted variable paths', () => {
    const result = replaceVariables(
      'Owner: {{ config.repo.owner }}',
      (path) => (path === 'config.repo.owner' ? 'birdcar' : '')
    );
    expect(result).toBe('Owner: birdcar');
  });

  test('replaces with empty string for unknown variables', () => {
    const result = replaceVariables('Hello {{ unknown }}!', () => '');
    expect(result).toBe('Hello !');
  });

  test('preserves text without variables', () => {
    const result = replaceVariables('Hello World!', () => 'REPLACED');
    expect(result).toBe('Hello World!');
  });

  test('handles empty input', () => {
    const result = replaceVariables('', () => 'REPLACED');
    expect(result).toBe('');
  });

  test('replaces all occurrences of same variable', () => {
    const result = replaceVariables(
      '{{ name }} meets {{ name }}',
      () => 'Alice'
    );
    expect(result).toBe('Alice meets Alice');
  });
});
