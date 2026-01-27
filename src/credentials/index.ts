import { getTokenFromGhCli, getRepoFromGhCli } from './gh-cli.js';

export interface Credentials {
  token: string;
  owner: string;
  repo: string;
}

export interface CredentialOptions {
  token?: string; // From --token flag
  repo?: string; // From --repo flag (owner/repo format)
  skipGhCli?: boolean; // For testing
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
 * Resolution chain: gh CLI → CLI flags → environment variables.
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

  // 3. Environment variables as final fallback
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

  // 4. Check for missing fields
  const missing: ('token' | 'repo')[] = [];
  if (!token) missing.push('token');
  if (!owner || !repo) missing.push('repo');

  if (missing.length > 0) {
    throw new CredentialResolutionError(
      missing,
      buildCredentialErrorMessage(missing)
    );
  }

  return { token: token!, owner: owner!, repo: repo! };
}

function buildCredentialErrorMessage(missing: ('token' | 'repo')[]): string {
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

  return lines.join('\n');
}

export { getTokenFromGhCli, getRepoFromGhCli, isGhCliAvailable } from './gh-cli.js';
