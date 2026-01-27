import { join } from 'path';

export const BIRDHOUSE_DIR = '.birdhouse';

export function getBirdhousePath(...segments: string[]): string {
  return join(process.cwd(), BIRDHOUSE_DIR, ...segments);
}

export function getRepoRoot(): string {
  return process.cwd();
}
