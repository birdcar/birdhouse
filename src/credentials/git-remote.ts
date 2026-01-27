import git from 'isomorphic-git';
import fs from 'node:fs';

/**
 * Extract owner/repo from git remotes for auto-detection.
 * Prefers 'origin' remote, falls back to first GitHub remote.
 */
export async function getRepoFromGitRemote(): Promise<{ owner: string; repo: string } | null> {
  try {
    const remotes = await git.listRemotes({ fs, dir: process.cwd() });

    // Prefer 'origin', fall back to first GitHub remote
    const origin = remotes.find((r) => r.remote === 'origin');
    const githubRemote = remotes.find((r) => r.url.includes('github.com'));

    const remote = origin?.url.includes('github.com') ? origin : githubRemote;
    if (!remote) return null;

    return parseGitHubUrl(remote.url);
  } catch {
    return null; // Not a git repo or other error
  }
}

/**
 * Parse a GitHub URL (HTTPS or SSH) into owner/repo.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (httpsMatch && httpsMatch[1] && httpsMatch[2]) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  }

  // SSH: git@github.com:owner/repo.git
  const sshMatch = url.match(/github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (sshMatch && sshMatch[1] && sshMatch[2]) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  return null;
}
