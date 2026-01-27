import { existsSync } from 'fs';
import { getBirdhousePath } from './paths.js';

export async function listTemplates(): Promise<string[]> {
  const templatesDir = getBirdhousePath('templates');
  const templates: string[] = [];

  // Return empty array if templates directory doesn't exist
  if (!existsSync(templatesDir)) {
    return templates;
  }

  const glob = new Bun.Glob('**/*.md');
  for await (const file of glob.scan(templatesDir)) {
    // Remove .md extension for template name
    templates.push(file.replace(/\.md$/, ''));
  }

  return templates.sort();
}

export async function loadTemplate(name: string): Promise<string> {
  const templatePath = getBirdhousePath('templates', `${name}.md`);
  const file = Bun.file(templatePath);

  if (!(await file.exists())) {
    const available = await listTemplates();
    const availableList =
      available.length > 0
        ? `\nAvailable templates:\n${available.map((t) => `  - ${t}`).join('\n')}`
        : '\nNo templates found. Create one in .birdhouse/templates/';

    throw new Error(`Template not found: ${name}${availableList}`);
  }

  return file.text();
}
