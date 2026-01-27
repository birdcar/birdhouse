import type { Root, ListItem, Paragraph, Text } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { parseTaskLine } from './parser.js';
import type { Task } from './types.js';

export interface ExtractedTasks {
  tasks: Task[];
}

export const remarkExtractTasks: Plugin<[], Root, Root> = () => {
  return (tree, file) => {
    const tasks: Task[] = [];
    let lineCounter = 0;

    visit(tree, 'listItem', (node: ListItem) => {
      // Get the raw text content of this list item
      const text = getListItemText(node);
      if (!text) return;

      // Check if it's a task list item (has checkbox)
      if (node.checked !== null && node.checked !== undefined) {
        lineCounter++;
        const task = parseTaskLine(`- [${node.checked ? 'x' : ' '}] ${text}`, lineCounter);
        if (task) {
          tasks.push(task);
        }
      }
    });

    // Attach extracted tasks to file data
    file.data.tasks = tasks;
  };
};

function getListItemText(node: ListItem): string | null {
  const paragraph = node.children.find((c): c is Paragraph => c.type === 'paragraph');
  if (!paragraph) return null;

  return paragraph.children
    .filter((c): c is Text => c.type === 'text')
    .map(t => t.value)
    .join('');
}
