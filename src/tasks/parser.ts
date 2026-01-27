import type { Task, TaskStatus, TaskMarker } from './types.js';

// Regex for task lines: - [ ] or - [x] followed by optional marker and text
const TASK_LINE_REGEX = /^(\s*)-\s*\[([ xX])\]\s*(.*)$/;
const MARKER_REGEX = /^([<>~$])(\d)?\s*(.*)$/;

export function parseTaskLine(line: string, lineNumber: number): Task | null {
  const match = line.match(TASK_LINE_REGEX);
  if (!match) return null;

  const checkbox = match[2]!;
  const rest = match[3] ?? '';
  const status: TaskStatus = checkbox.toLowerCase() === 'x' ? 'complete' : 'incomplete';

  // Parse marker from rest of line
  const markerMatch = rest.match(MARKER_REGEX);

  let marker: TaskMarker = 'none';
  let priority: 1 | 2 | 3 | null = null;
  let text = rest.trim();

  if (markerMatch) {
    const markerChar = markerMatch[1];
    const priorityNum = markerMatch[2];
    const markerText = markerMatch[3] ?? '';
    text = markerText.trim();

    switch (markerChar) {
      case '<':
        marker = 'scheduled';
        break;
      case '>':
        marker = 'migrated';
        break;
      case '~':
        marker = 'irrelevant';
        break;
      case '$':
        marker = 'priority';
        priority = priorityNum ? (parseInt(priorityNum, 10) as 1 | 2 | 3) : 2;
        // Clamp to valid range
        if (priority < 1) priority = 1;
        if (priority > 3) priority = 3;
        break;
    }
  }

  return {
    status,
    marker,
    priority,
    text,
    raw: line,
    lineNumber,
  };
}

export function taskToMarkdown(task: Task, asMigrated: boolean = false): string {
  const checkbox = task.status === 'complete' ? '[x]' : '[ ]';

  let marker = '';
  if (asMigrated && task.marker !== 'migrated') {
    marker = '> ';  // Convert to migrated marker
  } else if (task.marker === 'scheduled') {
    marker = '< ';
  } else if (task.marker === 'migrated') {
    marker = '> ';
  } else if (task.marker === 'irrelevant') {
    marker = '~ ';
  } else if (task.marker === 'priority') {
    marker = task.priority === 2 ? '$ ' : `$${task.priority} `;
  }

  return `- ${checkbox} ${marker}${task.text}`;
}
