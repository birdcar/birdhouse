import * as github from '@actions/github';

type OctokitInstance = ReturnType<typeof github.getOctokit>;

export interface GitHubClient {
  octokit: OctokitInstance;
  owner: string;
  repo: string;
}

export function getGitHubClient(): GitHubClient {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      'GITHUB_TOKEN environment variable required for GitHub operations.'
    );
  }

  const octokit = github.getOctokit(token);

  const repoEnv = process.env.GITHUB_REPOSITORY;
  if (!repoEnv) {
    throw new Error(
      'GITHUB_REPOSITORY environment variable required (format: owner/repo).'
    );
  }

  const [owner, repo] = repoEnv.split('/');
  if (!owner || !repo) {
    throw new Error(
      'GITHUB_REPOSITORY must be in format: owner/repo'
    );
  }

  return { octokit, owner, repo };
}
