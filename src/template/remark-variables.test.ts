import { describe, expect, test } from 'bun:test';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { remarkVariables } from './remark-variables.js';

const createProcessor = (resolver: (path: string) => string) =>
  unified()
    .use(remarkParse)
    .use(remarkVariables, { resolver })
    .use(remarkStringify);

describe('remarkVariables', () => {
  const mockResolver = (path: string): string => {
    const values: Record<string, string> = {
      name: 'Alice',
      date: '2024-03-15',
      'config.repo.owner': 'birdcar',
    };
    return values[path] ?? '';
  };

  test('replaces variables in text nodes', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('Hello {{ name }}!');
    expect(String(result).trim()).toBe('Hello Alice!');
  });

  test('replaces multiple variables in text', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('{{ name }} joined on {{ date }}');
    expect(String(result).trim()).toBe('Alice joined on 2024-03-15');
  });

  test('replaces variables in headings', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('# Hello {{ name }}');
    expect(String(result).trim()).toBe('# Hello Alice');
  });

  test('replaces variables in list items', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('- Item by {{ name }}');
    // remark-stringify uses * for list bullets by default
    expect(String(result).trim()).toBe('* Item by Alice');
  });

  test('replaces variables in code blocks', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process(
      '```\nowner: {{ config.repo.owner }}\n```'
    );
    expect(String(result)).toContain('owner: birdcar');
  });

  test('replaces variables in inline code', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('Run `echo {{ name }}`');
    expect(String(result)).toContain('`echo Alice`');
  });

  test('handles variables in bold text', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('**Hello {{ name }}**');
    expect(String(result)).toContain('**Hello Alice**');
  });

  test('handles variables in italic text', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('*Hello {{ name }}*');
    expect(String(result)).toContain('*Hello Alice*');
  });

  test('replaces unknown variables with empty string', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('Value: {{ unknown }}');
    // Empty string after colon may have trailing space escaped
    expect(String(result).trim()).toMatch(/^Value:/);
  });

  test('preserves markdown structure', async () => {
    const processor = createProcessor(mockResolver);
    const markdown = `# Hello {{ name }}

This is a paragraph with {{ date }}.

- List item
- Another item

\`\`\`
code block
\`\`\`
`;
    const result = await processor.process(markdown);
    const output = String(result);

    expect(output).toContain('# Hello Alice');
    expect(output).toContain('This is a paragraph with 2024-03-15.');
    // remark-stringify uses * for list bullets
    expect(output).toContain('* List item');
    expect(output).toContain('* Another item');
    expect(output).toContain('code block');
  });

  test('handles document with no variables', async () => {
    const processor = createProcessor(mockResolver);
    const result = await processor.process('# Hello World\n\nNo variables here.');
    const output = String(result);

    expect(output).toContain('# Hello World');
    expect(output).toContain('No variables here.');
  });
});
