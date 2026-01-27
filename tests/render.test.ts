import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { cli } from '../src/cli.js';

describe('render command', () => {
  const originalCwd = process.cwd();
  const testDir = join(import.meta.dir, '.test-render');

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
domains:
  - work
  - personal
`;

  const dailyTemplate = `# Daily Log for {{ date }}

## Tasks

- [ ] Task 1
- [ ] Task 2

## Notes

Owner: {{ config.repo.owner }}
`;

  beforeEach(async () => {
    const fs = await import('fs/promises');

    // Create test directory structure
    await fs.mkdir(join(testDir, '.birdhouse', 'templates'), {
      recursive: true,
    });
    await Bun.write(join(testDir, '.birdhouse', 'config.yaml'), configContent);
    await Bun.write(
      join(testDir, '.birdhouse', 'templates', 'daily.md'),
      dailyTemplate
    );

    // Change to test directory
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Restore original working directory
    process.chdir(originalCwd);

    // Clean up test directory
    const fs = await import('fs/promises');
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('shows help with --help flag', async () => {
    const exitCode = await cli.run(['render', '--help']);
    expect(exitCode).toBe(0);
  });

  test('lists templates with --list flag', async () => {
    const exitCode = await cli.run(['render', '--list']);
    expect(exitCode).toBe(0);
  });

  test('returns error when template name not provided', async () => {
    const exitCode = await cli.run(['render']);
    expect(exitCode).toBe(1);
  });

  test('renders template to stdout', async () => {
    // Capture stdout
    const chunks: Buffer[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    try {
      const exitCode = await cli.run(['render', 'daily']);
      expect(exitCode).toBe(0);

      const output = Buffer.concat(chunks).toString();
      expect(output).toContain('# Daily Log for');
      expect(output).toContain('Owner: testowner');
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  test('renders template to output file', async () => {
    const outputPath = join(testDir, 'output.md');
    const exitCode = await cli.run(['render', 'daily', '--output', outputPath]);
    expect(exitCode).toBe(0);

    const content = await Bun.file(outputPath).text();
    expect(content).toContain('# Daily Log for');
    expect(content).toContain('Owner: testowner');
  });

  test('renders template with custom variables', async () => {
    // Create a template that uses custom variables
    await Bun.write(
      join(testDir, '.birdhouse', 'templates', 'greeting.md'),
      'Hello {{ name }}!'
    );

    // Capture stdout
    const chunks: Buffer[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    try {
      const exitCode = await cli.run([
        'render',
        'greeting',
        '--var',
        'name=World',
      ]);
      expect(exitCode).toBe(0);

      const output = Buffer.concat(chunks).toString();
      expect(output).toContain('Hello World!');
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  test('returns error for missing template', async () => {
    const exitCode = await cli.run(['render', 'nonexistent']);
    expect(exitCode).toBe(1);
  });

  test('returns error for invalid variable format', async () => {
    const exitCode = await cli.run(['render', 'daily', '--var', 'invalid']);
    expect(exitCode).toBe(1);
  });

  test('handles nested templates', async () => {
    const fs = await import('fs/promises');
    await fs.mkdir(join(testDir, '.birdhouse', 'templates', 'rituals'), {
      recursive: true,
    });
    await Bun.write(
      join(testDir, '.birdhouse', 'templates', 'rituals', 'morning.md'),
      '# Morning Ritual\n\nDate: {{ date }}'
    );

    // Capture stdout
    const chunks: Buffer[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    try {
      const exitCode = await cli.run(['render', 'rituals/morning']);
      expect(exitCode).toBe(0);

      const output = Buffer.concat(chunks).toString();
      expect(output).toContain('# Morning Ritual');
      expect(output).toContain('Date:');
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  test('handles multiple custom variables', async () => {
    await Bun.write(
      join(testDir, '.birdhouse', 'templates', 'multi.md'),
      '{{ greeting }}, {{ name }}!'
    );

    // Capture stdout
    const chunks: Buffer[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    try {
      const exitCode = await cli.run([
        'render',
        'multi',
        '--var',
        'greeting=Hello',
        '--var',
        'name=World',
      ]);
      expect(exitCode).toBe(0);

      const output = Buffer.concat(chunks).toString();
      expect(output).toContain('Hello, World!');
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  test('handles variable values containing equals sign', async () => {
    await Bun.write(
      join(testDir, '.birdhouse', 'templates', 'equals.md'),
      'URL: {{ url }}'
    );

    // Capture stdout
    const chunks: Buffer[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: Buffer | string) => {
      chunks.push(Buffer.from(chunk));
      return true;
    };

    try {
      const exitCode = await cli.run([
        'render',
        'equals',
        '--var',
        'url=https://example.com?foo=bar',
      ]);
      expect(exitCode).toBe(0);

      const output = Buffer.concat(chunks).toString();
      // remark-stringify escapes colons in certain contexts
      expect(output).toContain('example.com?foo=bar');
    } finally {
      process.stdout.write = originalWrite;
    }
  });
});
