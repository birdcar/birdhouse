import * as github from '@actions/github';
import { resolveCredentials } from '../credentials/index.js';

type OctokitInstance = ReturnType<typeof github.getOctokit>;

export interface GitHubClient {
  octokit: OctokitInstance;
  owner: string;
  repo: string;
}

export interface GitHubClientOptions {
  token?: string;
  repo?: string;
}

export async function getGitHubClient(
  options: GitHubClientOptions = {}
): Promise<GitHubClient> {
  const credentials = await resolveCredentials(options);

  const octokit = github.getOctokit(credentials.token);

  return {
    octokit,
    owner: credentials.owner,
    repo: credentials.repo,
  };
}
