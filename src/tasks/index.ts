import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { remarkExtractTasks } from './remark-tasks.js';
import type { Task } from './types.js';
import { taskToMarkdown } from './parser.js';

export * from './types.js';
export * from './parser.js';

export async function extractTasks(markdown: string): Promise<Task[]> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkExtractTasks)
    .use(remarkStringify);

  const file = await processor.process(markdown);
  return (file.data.tasks as Task[]) ?? [];
}

export function filterMigratableTasks(tasks: Task[]): Task[] {
  return tasks.filter(task => {
    // Skip completed tasks
    if (task.status === 'complete') return false;
    // Skip irrelevant tasks
    if (task.marker === 'irrelevant') return false;
    return true;
  });
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  // Stable sort: priority 1 > 2 > 3 > null
  return [...tasks].sort((a, b) => {
    const priorityA = a.priority ?? 4;  // null = lowest
    const priorityB = b.priority ?? 4;
    return priorityA - priorityB;
  });
}

export function tasksToMarkdown(tasks: Task[], asMigrated: boolean = true): string {
  return tasks.map(t => taskToMarkdown(t, asMigrated)).join('\n');
}
