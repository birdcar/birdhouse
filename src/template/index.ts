import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { remarkVariables } from './remark-variables.js';
import { createVariableResolver, type VariableContext } from './variables.js';
import { loadConfig } from '../config/index.js';

export interface RenderOptions {
  template: string;
  customVariables?: Record<string, string>;
  date?: Date;
}

export async function renderTemplate(options: RenderOptions): Promise<string> {
  const config = await loadConfig();

  const context: VariableContext = {
    config,
    custom: options.customVariables ?? {},
    date: options.date ?? new Date(),
  };

  const resolver = createVariableResolver(context);

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkVariables, { resolver })
    .use(remarkStringify, {
      bullet: '-',
      emphasis: '_',
      strong: '*',
      listItemIndent: 'one',
    });

  const result = await processor.process(options.template);
  return String(result);
}

export { createVariableResolver, type VariableContext } from './variables.js';
export { extractVariables, replaceVariables } from './parser.js';
