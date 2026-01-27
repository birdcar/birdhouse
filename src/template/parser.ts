const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*\}\}/g;

export interface VariableMatch {
  match: string;
  path: string;
  start: number;
  end: number;
}

export function extractVariables(text: string): VariableMatch[] {
  const matches: VariableMatch[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  VARIABLE_PATTERN.lastIndex = 0;

  while ((match = VARIABLE_PATTERN.exec(text)) !== null) {
    matches.push({
      match: match[0],
      path: match[1] ?? '',
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  return matches;
}

export function replaceVariables(
  text: string,
  resolver: (path: string) => string
): string {
  return text.replace(VARIABLE_PATTERN, (_, path) => resolver(path));
}
