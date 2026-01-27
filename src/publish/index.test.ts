import { describe, expect, it } from 'bun:test';
import {
  PUBLISHABLE_ASSETS,
  filterAssets,
  getAssetContent,
} from './index.js';

describe('PUBLISHABLE_ASSETS', () => {
  it('contains workflow assets', () => {
    const workflows = PUBLISHABLE_ASSETS.filter(
      (a) => a.category === 'workflow'
    );
    expect(workflows.length).toBeGreaterThan(0);
    expect(workflows.every((a) => a.destination.includes('.github/workflows/')))
      .toBe(true);
  });

  it('contains template assets', () => {
    const templates = PUBLISHABLE_ASSETS.filter(
      (a) => a.category === 'template'
    );
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((a) => a.destination.includes('.birdhouse/templates/')))
      .toBe(true);
  });

  it('contains ritual assets', () => {
    const rituals = PUBLISHABLE_ASSETS.filter((a) => a.category === 'ritual');
    expect(rituals.length).toBeGreaterThan(0);
    expect(rituals.every((a) => a.destination.includes('.birdhouse/rituals/')))
      .toBe(true);
  });

  it('contains domain assets for all 9 domains', () => {
    const domains = PUBLISHABLE_ASSETS.filter((a) => a.category === 'domain');
    expect(domains.length).toBe(9);

    const domainNames = [
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
    for (const name of domainNames) {
      expect(domains.some((a) => a.destination === `${name}/README.md`)).toBe(
        true
      );
    }
  });
});

describe('filterAssets', () => {
  it('returns all assets when no filter specified', () => {
    const result = filterAssets(PUBLISHABLE_ASSETS, {});
    expect(result.length).toBe(PUBLISHABLE_ASSETS.length);
  });

  it('filters to only workflows when workflows=true', () => {
    const result = filterAssets(PUBLISHABLE_ASSETS, { workflows: true });
    expect(result.every((a) => a.category === 'workflow')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters to templates and rituals when templates=true', () => {
    const result = filterAssets(PUBLISHABLE_ASSETS, { templates: true });
    expect(
      result.every((a) => a.category === 'template' || a.category === 'ritual')
    ).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('filters to domains when domains=true', () => {
    const result = filterAssets(PUBLISHABLE_ASSETS, { domains: true });
    expect(result.every((a) => a.category === 'domain')).toBe(true);
    expect(result.length).toBe(9);
  });

  it('combines multiple filters', () => {
    const result = filterAssets(PUBLISHABLE_ASSETS, {
      workflows: true,
      domains: true,
    });
    expect(
      result.every((a) => a.category === 'workflow' || a.category === 'domain')
    ).toBe(true);
  });
});

describe('getAssetContent', () => {
  it('loads workflow asset content', async () => {
    const workflow = PUBLISHABLE_ASSETS.find(
      (a) => a.source === 'workflows/daily-thread.yml'
    )!;
    const content = await getAssetContent(workflow);

    expect(content).toContain('name: Daily Thread');
    expect(content).toContain('birdcar/birdhouse');
  });

  it('loads template asset content', async () => {
    const template = PUBLISHABLE_ASSETS.find(
      (a) => a.source === 'templates/daily.md'
    )!;
    const content = await getAssetContent(template);

    expect(content).toContain('# {{ date.weekday }}');
    expect(content).toContain('Big Three');
  });

  it('loads domain asset content', async () => {
    const domain = PUBLISHABLE_ASSETS.find(
      (a) => a.source === 'domains/body/README.md'
    )!;
    const content = await getAssetContent(domain);

    expect(content).toContain('# Body');
  });
});
