import { parse as parseYaml } from 'yaml';
import { configSchema, type BirdhouseConfig } from './schema.js';
import { getBirdhousePath } from '../utils/paths.js';

export async function loadConfig(): Promise<BirdhouseConfig> {
  const configPath = getBirdhousePath('config.yaml');

  const file = Bun.file(configPath);
  if (!await file.exists()) {
    throw new Error(
      `Configuration not found at ${configPath}. Run 'bh init' to create it.`
    );
  }

  const content = await file.text();
  const parsed = parseYaml(content);

  const errors: string[] = [];
  if (!configSchema(parsed, { errors })) {
    throw new Error(`Invalid configuration:\n${errors.join('\n')}`);
  }

  return parsed;
}

export { type BirdhouseConfig } from './schema.js';
export { defaultConfig } from './defaults.js';
