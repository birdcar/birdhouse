import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import type { GitHubClient } from './index.js';

type IssueCreateParams =
  RestEndpointMethodTypes['issues']['create']['parameters'];

// Extract just the issue-specific fields from Octokit's params
export type CreateIssueOptions = Pick<
  IssueCreateParams,
  'title' | 'body' | 'labels' | 'assignees' | 'milestone'
>;

export async function createIssue(
  client: GitHubClient,
  options: CreateIssueOptions
): Promise<{ number: number; url: string }> {
  const { data } = await client.octokit.rest.issues.create({
    owner: client.owner,
    repo: client.repo,
    title: options.title,
    body: options.body,
    labels: options.labels,
    assignees: options.assignees,
    milestone: options.milestone,
  });

  return { number: data.number, url: data.html_url };
}

export async function pinIssue(
  client: GitHubClient,
  issueNumber: number
): Promise<void> {
  // Get issue node ID first
  const { data: issue } = await client.octokit.rest.issues.get({
    owner: client.owner,
    repo: client.repo,
    issue_number: issueNumber,
  });

  // GitHub GraphQL API required for pinning (not available in REST)
  await client.octokit.graphql(
    `
    mutation($issueId: ID!) {
      pinIssue(input: { issueId: $issueId }) {
        issue { id }
      }
    }
  `,
    { issueId: issue.node_id }
  );
}

export async function unpinIssue(
  client: GitHubClient,
  issueNumber: number
): Promise<void> {
  const { data: issue } = await client.octokit.rest.issues.get({
    owner: client.owner,
    repo: client.repo,
    issue_number: issueNumber,
  });

  await client.octokit.graphql(
    `
    mutation($issueId: ID!) {
      unpinIssue(input: { issueId: $issueId }) {
        issue { id }
      }
    }
  `,
    { issueId: issue.node_id }
  );
}

export async function getIssue(
  client: GitHubClient,
  issueNumber: number
): Promise<{ body: string | null; title: string }> {
  const { data } = await client.octokit.rest.issues.get({
    owner: client.owner,
    repo: client.repo,
    issue_number: issueNumber,
  });

  return { body: data.body ?? null, title: data.title };
}

export async function updateIssue(
  client: GitHubClient,
  issueNumber: number,
  updates: { body?: string; title?: string }
): Promise<void> {
  await client.octokit.rest.issues.update({
    owner: client.owner,
    repo: client.repo,
    issue_number: issueNumber,
    ...updates,
  });
}

export async function findPinnedDailyThread(
  client: GitHubClient,
  label: string = 'daily-thread'
): Promise<number | null> {
  // Find open issues with daily-thread label
  const { data: issues } = await client.octokit.rest.issues.listForRepo({
    owner: client.owner,
    repo: client.repo,
    labels: label,
    state: 'open',
    per_page: 10,
  });

  // Check which is pinned via GraphQL
  for (const issue of issues) {
    const { repository } = await client.octokit.graphql<{
      repository: { issue: { isPinned: boolean } };
    }>(
      `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            isPinned
          }
        }
      }
    `,
      {
        owner: client.owner,
        repo: client.repo,
        number: issue.number,
      }
    );

    if (repository.issue.isPinned) {
      return issue.number;
    }
  }

  return null;
}
