import git from 'isomorphic-git';
import * as fs from 'fs';
import { getRepoRoot } from '../utils/paths.js';

export async function commitFiles(
  files: string[],
  message: string
): Promise<string> {
  const dir = getRepoRoot();

  // Stage files
  for (const file of files) {
    await git.add({ fs, dir, filepath: file });
  }

  // Commit
  const sha = await git.commit({
    fs,
    dir,
    message,
    author: {
      name: process.env.GIT_AUTHOR_NAME ?? 'Birdhouse',
      email: process.env.GIT_AUTHOR_EMAIL ?? 'birdhouse@users.noreply.github.com',
    },
  });

  return sha;
}
