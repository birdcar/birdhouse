import type { BirdhouseConfig } from '../config/schema.js';
import { generateScheduleCrons } from '../utils/schedule.js';
import { ASSET_CONTENTS } from './assets.js';

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
    source: 'rituals/workday-startup.md',
    destination: '.birdhouse/rituals/workday-startup.md',
    category: 'ritual',
  },
  {
    source: 'rituals/workday-shutdown.md',
    destination: '.birdhouse/rituals/workday-shutdown.md',
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
  asset: PublishableAsset,
  config?: BirdhouseConfig
): Promise<string> {
  const content = ASSET_CONTENTS[asset.source];
  if (!content) {
    throw new Error(`Asset not found: ${asset.source}`);
  }

  // Interpolate schedule placeholders for workflow files
  if (asset.category === 'workflow' && config) {
    return interpolateSchedule(content, config);
  }

  return content;
}

/**
 * Interpolate schedule placeholders in workflow content.
 * Replaces {{schedule.daily}}, {{schedule.morningWeekdays}}, etc.
 */
function interpolateSchedule(content: string, config: BirdhouseConfig): string {
  const crons = generateScheduleCrons(config.schedule);

  return content
    .replace(/\{\{schedule\.daily\}\}/g, crons.daily)
    .replace(/\{\{schedule\.morningWeekdays\}\}/g, crons.morningWeekdays)
    .replace(/\{\{schedule\.workdayStartupWeekdays\}\}/g, crons.workdayStartupWeekdays)
    .replace(/\{\{schedule\.workdayShutdownWeekdays\}\}/g, crons.workdayShutdownWeekdays)
    .replace(/\{\{schedule\.eveningWeekdays\}\}/g, crons.eveningWeekdays)
    .replace(/\{\{schedule\.sundayEvening\}\}/g, crons.sundayEvening);
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
