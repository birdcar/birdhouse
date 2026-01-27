import type { BirdhouseConfig } from './schema.js';

export const defaultConfig: BirdhouseConfig = {
  version: '1',
  repo: {
    owner: '{{ env.GITHUB_REPOSITORY_OWNER }}',
    name: '{{ env.GITHUB_REPOSITORY }}',
  },
  daily: {
    titleFormat: 'Daily Thread - {{ date }}',
    template: 'daily',
    labels: ['daily-thread'],
    pinned: true,
  },
  domains: ['body', 'mind', 'work', 'money', 'community', 'family', 'hobbies', 'love', 'spirit'],
};
