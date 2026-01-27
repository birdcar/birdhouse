import { describe, expect, it, mock } from 'bun:test';
import type { GitHubClient } from './index.js';
import {
  createIssue,
  pinIssue,
  unpinIssue,
  findPinnedDailyThread,
} from './issues.js';

function createMockClient(): GitHubClient {
  return {
    owner: 'testowner',
    repo: 'testrepo',
    octokit: {
      rest: {
        issues: {
          create: mock(() =>
            Promise.resolve({
              data: { number: 42, html_url: 'https://github.com/testowner/testrepo/issues/42' },
            })
          ),
          get: mock(() =>
            Promise.resolve({
              data: { node_id: 'I_1234567890' },
            })
          ),
          listForRepo: mock(() =>
            Promise.resolve({
              data: [
                { number: 1 },
                { number: 2 },
              ],
            })
          ),
        },
      },
      graphql: mock(() => Promise.resolve({ repository: { issue: { isPinned: false } } })),
    } as unknown as GitHubClient['octokit'],
  };
}

describe('createIssue', () => {
  it('creates an issue with the given options', async () => {
    const client = createMockClient();

    const result = await createIssue(client, {
      title: 'Test Issue',
      body: 'Test body',
      labels: ['test-label'],
    });

    expect(result.number).toBe(42);
    expect(result.url).toBe('https://github.com/testowner/testrepo/issues/42');
    expect(client.octokit.rest.issues.create).toHaveBeenCalledWith({
      owner: 'testowner',
      repo: 'testrepo',
      title: 'Test Issue',
      body: 'Test body',
      labels: ['test-label'],
      assignees: undefined,
      milestone: undefined,
    });
  });
});

describe('pinIssue', () => {
  it('gets issue node_id and calls GraphQL mutation', async () => {
    const client = createMockClient();

    await pinIssue(client, 42);

    expect(client.octokit.rest.issues.get).toHaveBeenCalledWith({
      owner: 'testowner',
      repo: 'testrepo',
      issue_number: 42,
    });
    expect(client.octokit.graphql).toHaveBeenCalled();
  });
});

describe('unpinIssue', () => {
  it('gets issue node_id and calls GraphQL mutation', async () => {
    const client = createMockClient();

    await unpinIssue(client, 42);

    expect(client.octokit.rest.issues.get).toHaveBeenCalledWith({
      owner: 'testowner',
      repo: 'testrepo',
      issue_number: 42,
    });
    expect(client.octokit.graphql).toHaveBeenCalled();
  });
});

describe('findPinnedDailyThread', () => {
  it('returns null when no pinned issue found', async () => {
    const client = createMockClient();

    const result = await findPinnedDailyThread(client, 'daily-thread');

    expect(result).toBeNull();
  });

  it('returns issue number when pinned issue found', async () => {
    const client = createMockClient();
    let callCount = 0;
    client.octokit.graphql = mock(() => {
      callCount++;
      // First issue is not pinned, second is pinned
      return Promise.resolve({
        repository: { issue: { isPinned: callCount === 2 } },
      });
    }) as unknown as typeof client.octokit.graphql;

    const result = await findPinnedDailyThread(client, 'daily-thread');

    expect(result).toBe(2);
  });
});
