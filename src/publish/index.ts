import { join } from 'path';

export interface PublishableAsset {
  source: string; // Path relative to assets/
  destination: string; // Path relative to repo root
  category: 'workflow' | 'template' | 'ritual' | 'domain';
}

const DOMAINS = [
  'body',
  'mind',
  'work',
  'money',
  'community',
  'family',
  'hobbies',
  'love',
  'spirit',
];

export const PUBLISHABLE_ASSETS: PublishableAsset[] = [
  // Workflows
  {
    source: 'workflows/daily-thread.yml',
    destination: '.github/workflows/daily-thread.yml',
    category: 'workflow',
  },
  {
    source: 'workflows/migration.yml',
    destination: '.github/workflows/migration.yml',
    category: 'workflow',
  },
  {
    source: 'workflows/rituals.yml',
    destination: '.github/workflows/rituals.yml',
    category: 'workflow',
  },

  // Templates
  {
    source: 'templates/daily.md',
    destination: '.birdhouse/templates/daily.md',
    category: 'template',
  },
  {
    source: 'templates/weekly.md',
    destination: '.birdhouse/templates/weekly.md',
    category: 'template',
  },
  {
    source: 'templates/quarterly.md',
    destination: '.birdhouse/templates/quarterly.md',
    category: 'template',
  },

  // Rituals
  {
    source: 'rituals/morning.md',
    destination: '.birdhouse/rituals/morning.md',
    category: 'ritual',
  },
  {
    source: 'rituals/evening.md',
    destination: '.birdhouse/rituals/evening.md',
    category: 'ritual',
  },
  {
    source: 'rituals/weekly-preview.md',
    destination: '.birdhouse/rituals/weekly-preview.md',
    category: 'ritual',
  },

  // Domains
  ...DOMAINS.map((domain) => ({
    source: `domains/${domain}/README.md`,
    destination: `${domain}/README.md`,
    category: 'domain' as const,
  })),
];

export async function getAssetContent(
  asset: PublishableAsset
): Promise<string> {
  // Assets are in src/publish/assets/ relative to this file
  const assetsDir = join(import.meta.dir, 'assets');
  const file = Bun.file(join(assetsDir, asset.source));
  return file.text();
}

export interface FilterOptions {
  workflows?: boolean;
  templates?: boolean;
  domains?: boolean;
}

export function filterAssets(
  assets: PublishableAsset[],
  options: FilterOptions
): PublishableAsset[] {
  const hasAnyFilter = options.workflows || options.templates || options.domains;

  return assets.filter((asset) => {
    // If no filter specified, include all
    if (!hasAnyFilter) return true;

    if (options.workflows && asset.category === 'workflow') return true;
    if (
      options.templates &&
      (asset.category === 'template' || asset.category === 'ritual')
    )
      return true;
    if (options.domains && asset.category === 'domain') return true;

    return false;
  });
}
