import type { NextFunction, Request, Response } from 'express';

import { pathToRegexp } from 'path-to-regexp';

import { getCachedData, updateSetOfUniqueRequest } from '@/cache';
import env from '@/config';
import { logger } from '@/utils/utils';

interface Rule {
  path?: Readonly<string>;
  regexp?: Readonly<RegExp>;
  tokenAware: Readonly<boolean>;
  cacheTag: Readonly<string>;
  cacheTTL: Readonly<number>;
  setOfUniqueRequest?: Readonly<string>;
  thunderingHerd?: Readonly<boolean>;
}

const defaultRule = {
  tokenAware: true,
  cacheTag: '',
  cacheTTL: 0, // in seconds, 0 to disable default cache
} satisfies Rule;

// caching rules
const rules: Rule[] = [
  {
    path: '/global-options(.*)',
    tokenAware: false,
    cacheTag: 'organizations',
    cacheTTL: env.TTL_SMALL,
    thunderingHerd: true,
  },
];

for (const rule of rules) {
  if (rule.path) {
    rule.regexp = pathToRegexp(rule.path, [], { end: false });
  }
}

export async function cacheResponse(req: Request, res: Response, next: NextFunction) {
  if (env.NO_REDIS) return next();

  const { method, originalUrl: url, path } = req;

  if (!['GET', 'POS'].includes(method)) return next();

  // check if any rule defined for this route
  let rule: Rule = defaultRule;

  for (const item of rules) {
    if (item.regexp.test(path)) {
      rule = item;
      break;
    }
  }

  // cache will be user specific if that url is user aware
  const keyPrefix = `cache:${method}:${url}/`;
  let cacheKey =
    !!req.headers.authorization && rule.tokenAware
      ? `${keyPrefix}:${req.headers.authorization || ''}`
      : `${keyPrefix}`;

  if (method === 'POST') {
    const body = JSON.stringify(req.body);
    cacheKey =
      !!req.headers.authorization && rule.tokenAware
        ? `${keyPrefix}:${req.headers.authorization || ''}/:${body}`
        : `${keyPrefix}:${body}`;
  }

  let cachedContent: string | undefined = undefined;

  if (rule.cacheTTL) {
    if (rule.setOfUniqueRequest)
      updateSetOfUniqueRequest(rule.setOfUniqueRequest, url, req.headers.authorization);

    cachedContent = await getCachedData(cacheKey, rule.thunderingHerd).catch(err => {
      logger.info({
        getCachedDataError: err.message,
      });

      return undefined;
    });
  }

  if (rule.cacheTTL && env.NODE_ENV !== 'production') {
    res.setHeader('x-key-used', `${cacheKey}`);
    res.setHeader('x-rule-path', `${rule.path || ''}`);
    res.setHeader('x-rule-ttl', `${rule.cacheTTL || ''}`);
    res.setHeader('x-rule-tag', `${rule.cacheTag || ''}`);
    res.setHeader('x-rule-tokenAware', `${rule.tokenAware}`);
    res.setHeader('x-rule-type', `${method}`);
  }

  // if we have a cache hit
  if (cacheKey && cacheKey.length && cachedContent) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('x-key-cached', `true`);
    res.send(cachedContent);
    return;
  }

  res.setHeader('x-key-cached', rule.cacheTTL ? 'false' : 'none');

  // if we have a cache miss add cache related properties to response object
  res.cacheKey = cacheKey;
  res.cacheTTL = rule.cacheTTL || defaultRule.cacheTTL;
  res.cacheTag = rule.cacheTag;

  next();
}
