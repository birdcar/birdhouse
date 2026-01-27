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
  schedule: {
    timezone: 'America/Chicago',
    daily: '06:00',
    rituals: {
      morning: '06:00',
      evening: '18:00',
      weeklyPreview: '18:00',
    },
  },
  domains: ['body', 'mind', 'work', 'money', 'community', 'family', 'hobbies', 'love', 'spirit'],
};
