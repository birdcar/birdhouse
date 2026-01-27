import * as t from 'typanion';

export const configSchema = t.isObject({
  version: t.isLiteral('1'),
  repo: t.isObject({
    owner: t.isString(),
    name: t.isString(),
  }),
  daily: t.isObject({
    titleFormat: t.isString(),
    template: t.isString(),
    labels: t.isArray(t.isString()),
    pinned: t.isBoolean(),
  }),
  schedule: t.isObject({
    timezone: t.isString(),
    daily: t.isString(),
    rituals: t.isObject({
      morning: t.isString(),
      evening: t.isString(),
      weeklyPreview: t.isString(),
    }),
  }),
  domains: t.isArray(t.isString()),
});

export type BirdhouseConfig = t.InferType<typeof configSchema>;
