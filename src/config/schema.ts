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
  domains: t.isArray(t.isString()),
});

export type BirdhouseConfig = t.InferType<typeof configSchema>;
