import type { Root, Text, Code, InlineCode } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { replaceVariables } from './parser.js';

export interface RemarkVariablesOptions {
  resolver: (path: string) => string;
}

export const remarkVariables: Plugin<[RemarkVariablesOptions], Root> = (
  options
) => {
  return (tree) => {
    visit(tree, 'text', (node: Text) => {
      node.value = replaceVariables(node.value, options.resolver);
    });

    // Also process code blocks (for template examples in docs)
    visit(tree, 'code', (node: Code) => {
      if (node.value) {
        node.value = replaceVariables(node.value, options.resolver);
      }
    });

    // Process inline code
    visit(tree, 'inlineCode', (node: InlineCode) => {
      if (node.value) {
        node.value = replaceVariables(node.value, options.resolver);
      }
    });
  };
};
