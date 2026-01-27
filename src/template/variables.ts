import type { BirdhouseConfig } from '../config/schema.js';

export interface VariableContext {
  config: BirdhouseConfig;
  custom: Record<string, string>;
  date: Date;
}

export function createVariableResolver(context: VariableContext) {
  return function resolve(path: string): string {
    const parts = path.split('.');
    const [source, ...rest] = parts;

    switch (source) {
      case 'date':
        return resolveDateVariable(rest, context.date);
      case 'config':
        return resolveObjectPath(context.config, rest);
      case 'env':
        return process.env[rest.join('.')] ?? '';
      default:
        // Check custom variables first, then treat as config shorthand
        if (context.custom[path] !== undefined) {
          return context.custom[path];
        }
        return '';
    }
  };
}

function resolveDateVariable(parts: string[], date: Date): string {
  if (parts.length === 0) {
    return date.toISOString().split('T')[0] ?? ''; // YYYY-MM-DD
  }

  const [field] = parts;
  switch (field) {
    case 'year':
      return String(date.getFullYear());
    case 'month':
      return String(date.getMonth() + 1).padStart(2, '0');
    case 'day':
      return String(date.getDate()).padStart(2, '0');
    case 'weekday':
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    default:
      return '';
  }
}

function resolveObjectPath(obj: unknown, path: string[]): string {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || typeof current !== 'object') {
      return '';
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current === undefined ? '' : String(current);
}
