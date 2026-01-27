/**
 * Helper functions for extracting credentials from the gh CLI.
 * Returns null for any failure to allow fallthrough to other sources.
 */

export async function getTokenFromGhCli(): Promise<string | null> {
  try {
    const proc = Bun.spawn(['gh', 'auth', 'token'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) return null;

    const token = await new Response(proc.stdout).text();
    return token.trim() || null;
  } catch {
    return null; // gh not installed or not in PATH
  }
}

export async function getRepoFromGhCli(): Promise<{ owner: string; repo: string } | null> {
  try {
    const proc = Bun.spawn(['gh', 'repo', 'view', '--json', 'nameWithOwner'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exitCode = await proc.exited;
    if (exitCode !== 0) return null;

    const output = await new Response(proc.stdout).text();
    const data = JSON.parse(output) as { nameWithOwner: string };
    const [owner, repo] = data.nameWithOwner.split('/');
    return owner && repo ? { owner, repo } : null;
  } catch {
    return null; // gh not installed, not in repo, or parse error
  }
}

export async function isGhCliAvailable(): Promise<boolean> {
  try {
    const proc = Bun.spawn(['gh', '--version'], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const exitCode = await proc.exited;
    return exitCode === 0;
  } catch {
    return false;
  }
}
