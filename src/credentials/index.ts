import { getTokenFromGhCli, getRepoFromGhCli } from './gh-cli.js';
import { getRepoFromGitRemote } from './git-remote.js';
import { isTTY, promptToken, promptRepo } from './prompt.js';

export interface Credentials {
  token: string;
  owner: string;
  repo: string;
}

export interface CredentialOptions {
  token?: string; // From --token flag
  repo?: string; // From --repo flag (owner/repo format)
  skipGhCli?: boolean; // For testing
  noPrompt?: boolean; // From --no-prompt flag
}

export class CredentialResolutionError extends Error {
  constructor(
    public readonly missingFields: ('token' | 'repo')[],
    message: string
  ) {
    super(message);
    this.name = 'CredentialResolutionError';
  }
}

/**
 * Resolve GitHub credentials from multiple sources.
 * Resolution chain: gh CLI → CLI flags → environment variables → git remote → interactive prompts.
 * Throws CredentialResolutionError with helpful message if unresolved.
 */
export async function resolveCredentials(
  options: CredentialOptions = {}
): Promise<Credentials> {
  let token: string | null = null;
  let owner: string | null = null;
  let repo: string | null = null;

  // 1. Try gh CLI first (unless skipped)
  if (!options.skipGhCli) {
    token = await getTokenFromGhCli();
    const ghRepo = await getRepoFromGhCli();
    if (ghRepo) {
      owner = ghRepo.owner;
      repo = ghRepo.repo;
    }
  }

  // 2. CLI flags override gh CLI results
  if (options.token) {
    token = options.token;
  }
  if (options.repo) {
    const [flagOwner, flagRepo] = options.repo.split('/');
    if (flagOwner && flagRepo) {
      owner = flagOwner;
      repo = flagRepo;
    }
  }

  // 3. Environment variables
  if (!token && process.env.GITHUB_TOKEN) {
    token = process.env.GITHUB_TOKEN;
  }
  if ((!owner || !repo) && process.env.GITHUB_REPOSITORY) {
    const [envOwner, envRepo] = process.env.GITHUB_REPOSITORY.split('/');
    if (envOwner && envRepo) {
      owner = envOwner;
      repo = envRepo;
    }
  }

  // 4. Git remote for repo (before prompts)
  if (!owner || !repo) {
    const gitRemote = await getRepoFromGitRemote();
    if (gitRemote) {
      owner = gitRemote.owner;
      repo = gitRemote.repo;
    }
  }

  // 5. Interactive prompts (TTY only, unless --no-prompt)
  if (!options.noPrompt && isTTY()) {
    if (!token) {
      try {
        token = await promptToken();
      } catch {
        // User cancelled or timeout - continue to error
      }
    }
    if (!owner || !repo) {
      try {
        const input = await promptRepo();
        const [promptOwner, promptRepoName] = input.split('/');
        if (promptOwner && promptRepoName) {
          owner = promptOwner;
          repo = promptRepoName;
        }
      } catch {
        // User cancelled or timeout - continue to error
      }
    }
  }

  // 6. Check for missing fields
  const missing: ('token' | 'repo')[] = [];
  if (!token) missing.push('token');
  if (!owner || !repo) missing.push('repo');

  if (missing.length > 0) {
    throw new CredentialResolutionError(
      missing,
      buildCredentialErrorMessage(missing, options.noPrompt ?? !isTTY())
    );
  }

  return { token: token!, owner: owner!, repo: repo! };
}

function buildCredentialErrorMessage(
  missing: ('token' | 'repo')[],
  isNonInteractive: boolean
): string {
  const lines = ['GitHub credentials required but not found.', ''];

  if (missing.includes('token')) {
    lines.push('Missing: GitHub token');
  }
  if (missing.includes('repo')) {
    lines.push('Missing: Repository (owner/repo)');
  }

  lines.push('', 'Provide credentials via:');
  lines.push('  1. gh CLI: Run `gh auth login` to authenticate');
  lines.push('  2. Flags: --token <token> --repo <owner/repo>');
  lines.push('  3. Environment: GITHUB_TOKEN and GITHUB_REPOSITORY');

  if (isNonInteractive) {
    lines.push('', 'Note: Interactive prompts disabled (non-TTY or --no-prompt)');
  }

  return lines.join('\n');
}

export { getTokenFromGhCli, getRepoFromGhCli, isGhCliAvailable } from './gh-cli.js';
export { getRepoFromGitRemote, parseGitHubUrl } from './git-remote.js';
export { isTTY } from './prompt.js';
