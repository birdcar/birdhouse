import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { renderTemplate } from './index.js';

describe('renderTemplate', () => {
  const testDir = join(import.meta.dir, '../../.test-birdhouse');
  const configContent = `version: '1'
repo:
  owner: testowner
  name: testrepo
daily:
  titleFormat: 'Daily - {{ date }}'
  template: daily
  labels:
    - daily
  pinned: true
schedule:
  timezone: America/Chicago
  daily: '06:00'
  rituals:
    morning: '06:00'
    evening: '18:00'
    weeklyPreview: '18:00'
domains:
  - work
  - personal
`;

  beforeEach(async () => {
    // Create test .birdhouse directory with config
    await Bun.write(join(testDir, 'config.yaml'), configContent);

    // Change to test directory
    process.chdir(join(import.meta.dir, '../..'));
  });

  afterEach(async () => {
    // Clean up test directory
    const fs = await import('fs/promises');
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('renders template with date variable', async () => {
    // Create .birdhouse/config.yaml in current directory for loadConfig
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: '# Daily Log for {{ date }}',
        date: new Date('2024-03-15T10:00:00Z'),
      });

      expect(result).toContain('# Daily Log for 2024-03-15');
    } finally {
      // Clean up
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });

  test('renders template with config variables', async () => {
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: 'Repo: {{ config.repo.owner }}/{{ config.repo.name }}',
      });

      expect(result).toContain('Repo: testowner/testrepo');
    } finally {
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });

  test('renders template with custom variables', async () => {
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: 'Hello {{ name }}!',
        customVariables: { name: 'World' },
      });

      expect(result).toContain('Hello World!');
    } finally {
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });

  test('preserves GFM features like task lists', async () => {
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: '- [ ] Task for {{ name }}\n- [x] Completed',
        customVariables: { name: 'Alice' },
      });

      expect(result).toContain('- [ ] Task for Alice');
      expect(result).toContain('- [x] Completed');
    } finally {
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });

  test('handles multiple date subfields', async () => {
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: '{{ date.year }}-{{ date.month }}-{{ date.day }} ({{ date.weekday }})',
        date: new Date('2024-03-15T10:00:00Z'),
      });

      expect(result).toContain('2024-03-15 (Friday)');
    } finally {
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });

  test('renders unknown variables as empty string', async () => {
    await Bun.write('.birdhouse/config.yaml', configContent);

    try {
      const result = await renderTemplate({
        template: 'Value: {{ unknown }}!',
      });

      expect(result).toContain('Value: !');
    } finally {
      const fs = await import('fs/promises');
      await fs.rm('.birdhouse', { recursive: true, force: true });
    }
  });
});
