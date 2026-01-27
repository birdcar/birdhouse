import { describe, test, expect } from 'bun:test';
import {
  extractTasks,
  filterMigratableTasks,
  sortTasksByPriority,
  tasksToMarkdown,
} from './index.js';
import type { Task } from './types.js';

describe('extractTasks', () => {
  test('extracts tasks from markdown', async () => {
    const markdown = `
# Daily Thread

- [ ] Task 1
- [x] Task 2
- [ ] < Scheduled task
`;
    const tasks = await extractTasks(markdown);
    expect(tasks).toHaveLength(3);
    expect(tasks[0]!.text).toBe('Task 1');
    expect(tasks[0]!.status).toBe('incomplete');
    expect(tasks[1]!.text).toBe('Task 2');
    expect(tasks[1]!.status).toBe('complete');
    expect(tasks[2]!.text).toBe('Scheduled task');
    expect(tasks[2]!.marker).toBe('scheduled');
  });

  test('extracts tasks with various markers', async () => {
    const markdown = `
- [ ] Regular task
- [ ] > Migrated task
- [ ] ~ Irrelevant task
- [ ] $ Priority task
- [ ] $1 Urgent task
`;
    const tasks = await extractTasks(markdown);
    expect(tasks).toHaveLength(5);
    expect(tasks[0]!.marker).toBe('none');
    expect(tasks[1]!.marker).toBe('migrated');
    expect(tasks[2]!.marker).toBe('irrelevant');
    expect(tasks[3]!.marker).toBe('priority');
    expect(tasks[3]!.priority).toBe(2);
    expect(tasks[4]!.marker).toBe('priority');
    expect(tasks[4]!.priority).toBe(1);
  });

  test('handles empty markdown', async () => {
    const tasks = await extractTasks('');
    expect(tasks).toHaveLength(0);
  });

  test('handles markdown without tasks', async () => {
    const markdown = `
# Just a heading

Some regular text.

- Not a task
- Also not a task
`;
    const tasks = await extractTasks(markdown);
    expect(tasks).toHaveLength(0);
  });
});

describe('filterMigratableTasks', () => {
  const tasks: Task[] = [
    { status: 'incomplete', marker: 'none', priority: null, text: 'Regular task', raw: '', lineNumber: 1 },
    { status: 'complete', marker: 'none', priority: null, text: 'Done task', raw: '', lineNumber: 2 },
    { status: 'incomplete', marker: 'irrelevant', priority: null, text: 'Irrelevant task', raw: '', lineNumber: 3 },
    { status: 'incomplete', marker: 'scheduled', priority: null, text: 'Scheduled task', raw: '', lineNumber: 4 },
    { status: 'incomplete', marker: 'priority', priority: 1, text: 'Priority task', raw: '', lineNumber: 5 },
  ];

  test('filters out completed tasks', () => {
    const filtered = filterMigratableTasks(tasks);
    expect(filtered.find(t => t.text === 'Done task')).toBeUndefined();
  });

  test('filters out irrelevant tasks', () => {
    const filtered = filterMigratableTasks(tasks);
    expect(filtered.find(t => t.text === 'Irrelevant task')).toBeUndefined();
  });

  test('keeps incomplete, non-irrelevant tasks', () => {
    const filtered = filterMigratableTasks(tasks);
    expect(filtered).toHaveLength(3);
    expect(filtered.map(t => t.text)).toContain('Regular task');
    expect(filtered.map(t => t.text)).toContain('Scheduled task');
    expect(filtered.map(t => t.text)).toContain('Priority task');
  });

  test('handles empty array', () => {
    expect(filterMigratableTasks([])).toHaveLength(0);
  });
});

describe('sortTasksByPriority', () => {
  test('sorts by priority (1 > 2 > 3 > null)', () => {
    const tasks: Task[] = [
      { status: 'incomplete', marker: 'none', priority: null, text: 'No priority', raw: '', lineNumber: 1 },
      { status: 'incomplete', marker: 'priority', priority: 3, text: 'Low priority', raw: '', lineNumber: 2 },
      { status: 'incomplete', marker: 'priority', priority: 1, text: 'High priority', raw: '', lineNumber: 3 },
      { status: 'incomplete', marker: 'priority', priority: 2, text: 'Medium priority', raw: '', lineNumber: 4 },
    ];

    const sorted = sortTasksByPriority(tasks);
    expect(sorted[0]!.text).toBe('High priority');
    expect(sorted[1]!.text).toBe('Medium priority');
    expect(sorted[2]!.text).toBe('Low priority');
    expect(sorted[3]!.text).toBe('No priority');
  });

  test('preserves order within same priority level (stable sort)', () => {
    const tasks: Task[] = [
      { status: 'incomplete', marker: 'priority', priority: 2, text: 'First', raw: '', lineNumber: 1 },
      { status: 'incomplete', marker: 'priority', priority: 2, text: 'Second', raw: '', lineNumber: 2 },
      { status: 'incomplete', marker: 'priority', priority: 2, text: 'Third', raw: '', lineNumber: 3 },
    ];

    const sorted = sortTasksByPriority(tasks);
    expect(sorted[0]!.text).toBe('First');
    expect(sorted[1]!.text).toBe('Second');
    expect(sorted[2]!.text).toBe('Third');
  });

  test('does not mutate original array', () => {
    const tasks: Task[] = [
      { status: 'incomplete', marker: 'none', priority: null, text: 'Task 1', raw: '', lineNumber: 1 },
      { status: 'incomplete', marker: 'priority', priority: 1, text: 'Task 2', raw: '', lineNumber: 2 },
    ];

    const sorted = sortTasksByPriority(tasks);
    expect(tasks[0]!.text).toBe('Task 1');
    expect(sorted[0]!.text).toBe('Task 2');
  });

  test('handles empty array', () => {
    expect(sortTasksByPriority([])).toHaveLength(0);
  });
});

describe('tasksToMarkdown', () => {
  const tasks: Task[] = [
    { status: 'incomplete', marker: 'none', priority: null, text: 'Task 1', raw: '', lineNumber: 1 },
    { status: 'incomplete', marker: 'scheduled', priority: null, text: 'Task 2', raw: '', lineNumber: 2 },
    { status: 'incomplete', marker: 'priority', priority: 1, text: 'Task 3', raw: '', lineNumber: 3 },
  ];

  test('converts tasks to markdown', () => {
    const markdown = tasksToMarkdown(tasks, false);
    expect(markdown).toBe(`- [ ] Task 1
- [ ] < Task 2
- [ ] $1 Task 3`);
  });

  test('converts tasks to migrated markdown', () => {
    const markdown = tasksToMarkdown(tasks, true);
    expect(markdown).toBe(`- [ ] > Task 1
- [ ] > Task 2
- [ ] > Task 3`);
  });

  test('handles empty array', () => {
    expect(tasksToMarkdown([])).toBe('');
  });
});
