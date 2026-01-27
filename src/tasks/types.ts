export type TaskStatus =
  | 'incomplete'   // - [ ]
  | 'complete'     // - [x]
  ;

export type TaskMarker =
  | 'none'         // - [ ] regular task
  | 'scheduled'    // - [ ] < scheduled for today
  | 'migrated'     // - [ ] > migrated from previous day
  | 'irrelevant'   // - [ ] ~ no longer relevant
  | 'priority'     // - [ ] $ or $1/$2/$3
  ;

export interface Task {
  status: TaskStatus;
  marker: TaskMarker;
  priority: 1 | 2 | 3 | null;  // 1 = highest, null = unprioritized
  text: string;
  raw: string;  // Original markdown line
  lineNumber: number;
}

export interface ParsedTasks {
  tasks: Task[];
  otherContent: string;  // Non-task content preserved
}
