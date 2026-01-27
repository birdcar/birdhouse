import { describe, test, expect } from 'bun:test';
import { parseTaskLine, taskToMarkdown } from './parser.js';

describe('parseTaskLine', () => {
  test('parses incomplete task without marker', () => {
    const task = parseTaskLine('- [ ] Do something', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'none',
      priority: null,
      text: 'Do something',
      raw: '- [ ] Do something',
      lineNumber: 1,
    });
  });

  test('parses complete task', () => {
    const task = parseTaskLine('- [x] Done task', 1);
    expect(task).toEqual({
      status: 'complete',
      marker: 'none',
      priority: null,
      text: 'Done task',
      raw: '- [x] Done task',
      lineNumber: 1,
    });
  });

  test('parses uppercase X as complete', () => {
    const task = parseTaskLine('- [X] Done task', 1);
    expect(task?.status).toBe('complete');
  });

  test('parses scheduled marker (<)', () => {
    const task = parseTaskLine('- [ ] < Scheduled for today', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'scheduled',
      priority: null,
      text: 'Scheduled for today',
      raw: '- [ ] < Scheduled for today',
      lineNumber: 1,
    });
  });

  test('parses migrated marker (>)', () => {
    const task = parseTaskLine('- [ ] > Migrated from yesterday', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'migrated',
      priority: null,
      text: 'Migrated from yesterday',
      raw: '- [ ] > Migrated from yesterday',
      lineNumber: 1,
    });
  });

  test('parses irrelevant marker (~)', () => {
    const task = parseTaskLine('- [ ] ~ No longer needed', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'irrelevant',
      priority: null,
      text: 'No longer needed',
      raw: '- [ ] ~ No longer needed',
      lineNumber: 1,
    });
  });

  test('parses priority marker ($) defaults to priority 2', () => {
    const task = parseTaskLine('- [ ] $ Important task', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'priority',
      priority: 2,
      text: 'Important task',
      raw: '- [ ] $ Important task',
      lineNumber: 1,
    });
  });

  test('parses priority 1 marker ($1)', () => {
    const task = parseTaskLine('- [ ] $1 Urgent task', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'priority',
      priority: 1,
      text: 'Urgent task',
      raw: '- [ ] $1 Urgent task',
      lineNumber: 1,
    });
  });

  test('parses priority 3 marker ($3)', () => {
    const task = parseTaskLine('- [ ] $3 Low priority task', 1);
    expect(task).toEqual({
      status: 'incomplete',
      marker: 'priority',
      priority: 3,
      text: 'Low priority task',
      raw: '- [ ] $3 Low priority task',
      lineNumber: 1,
    });
  });

  test('clamps out-of-range priority to valid range', () => {
    const task = parseTaskLine('- [ ] $9 Very low', 1);
    expect(task?.priority).toBe(3);
  });

  test('returns null for non-task lines', () => {
    expect(parseTaskLine('Just some text', 1)).toBeNull();
    expect(parseTaskLine('- Not a checkbox', 1)).toBeNull();
    expect(parseTaskLine('1. Numbered list', 1)).toBeNull();
  });

  test('handles empty task text', () => {
    const task = parseTaskLine('- [ ] ', 1);
    expect(task?.text).toBe('');
  });

  test('handles task with marker but no text', () => {
    const task = parseTaskLine('- [ ] $ ', 1);
    expect(task?.marker).toBe('priority');
    expect(task?.text).toBe('');
  });

  test('preserves line number', () => {
    const task = parseTaskLine('- [ ] Task', 42);
    expect(task?.lineNumber).toBe(42);
  });

  test('handles indented tasks', () => {
    const task = parseTaskLine('  - [ ] Nested task', 1);
    expect(task?.text).toBe('Nested task');
  });
});

describe('taskToMarkdown', () => {
  const baseTask = {
    status: 'incomplete' as const,
    marker: 'none' as const,
    priority: null,
    text: 'Test task',
    raw: '- [ ] Test task',
    lineNumber: 1,
  };

  test('renders incomplete task', () => {
    expect(taskToMarkdown(baseTask)).toBe('- [ ] Test task');
  });

  test('renders complete task', () => {
    const task = { ...baseTask, status: 'complete' as const };
    expect(taskToMarkdown(task)).toBe('- [x] Test task');
  });

  test('renders scheduled marker', () => {
    const task = { ...baseTask, marker: 'scheduled' as const };
    expect(taskToMarkdown(task)).toBe('- [ ] < Test task');
  });

  test('renders migrated marker', () => {
    const task = { ...baseTask, marker: 'migrated' as const };
    expect(taskToMarkdown(task)).toBe('- [ ] > Test task');
  });

  test('renders irrelevant marker', () => {
    const task = { ...baseTask, marker: 'irrelevant' as const };
    expect(taskToMarkdown(task)).toBe('- [ ] ~ Test task');
  });

  test('renders priority marker with default priority', () => {
    const task = { ...baseTask, marker: 'priority' as const, priority: 2 as const };
    expect(taskToMarkdown(task)).toBe('- [ ] $ Test task');
  });

  test('renders priority 1 marker', () => {
    const task = { ...baseTask, marker: 'priority' as const, priority: 1 as const };
    expect(taskToMarkdown(task)).toBe('- [ ] $1 Test task');
  });

  test('renders priority 3 marker', () => {
    const task = { ...baseTask, marker: 'priority' as const, priority: 3 as const };
    expect(taskToMarkdown(task)).toBe('- [ ] $3 Test task');
  });

  test('converts to migrated marker when asMigrated is true', () => {
    const task = { ...baseTask, marker: 'scheduled' as const };
    expect(taskToMarkdown(task, true)).toBe('- [ ] > Test task');
  });

  test('keeps migrated marker when already migrated', () => {
    const task = { ...baseTask, marker: 'migrated' as const };
    expect(taskToMarkdown(task, true)).toBe('- [ ] > Test task');
  });

  test('converts regular task to migrated when asMigrated is true', () => {
    expect(taskToMarkdown(baseTask, true)).toBe('- [ ] > Test task');
  });
});
