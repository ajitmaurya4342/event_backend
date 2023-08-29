import type { NextFunction, Request, Response } from 'express';

import { cinematicDb, knex } from '@/database';
import { createResolvablePromise } from '@/utils/promises';
import { getIp } from '@/utils/utils';

type CacheKeys = 'global_options' | 'global_options_private';
type CacheResult = GlobalOptions[] | GlobalOptionsPrivate[];
type CacheResultPromise = Promise<CacheResult>;

class GlobalOptionsUtil {
  static currentResultPromiseForCacheKey = new Map<CacheKeys, CacheResultPromise>();

  static async get(key: CacheKeys) {
    // it was already called and is not yet completed
    const alreadyInProgressPromise = this.currentResultPromiseForCacheKey.get(key);

    if (alreadyInProgressPromise) {
      return alreadyInProgressPromise;
    }

    // there is no pending promise create promise to share with other calls before we save to redis
    const inProgressPromise = createResolvablePromise<CacheResult>();
    this.currentResultPromiseForCacheKey.set(key, inProgressPromise.promise);

    // get our data
    const cachedData = await cinematicDb(key);

    // when done - remove pending promise before resolving it
    this.currentResultPromiseForCacheKey.delete(key);
    inProgressPromise.resolve(cachedData);

    return cachedData;
  }
}

export async function setRequestVariables(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.reqIp = getIp(req);

  const globalOptions = await GlobalOptionsUtil.get('global_options');
  const globalOptionsPrivate = await GlobalOptionsUtil.get('global_options_private');

  const globalOptionsMap: Record<string, string> = {};
  const globalOptionsPrivateMap: Record<string, string> = {};

  globalOptions.forEach(row => {
    globalOptionsMap[row.go_key] = row.go_value;
  });

  globalOptionsPrivate.forEach(row => {
    globalOptionsPrivateMap[row.go_key] = row.go_value;
  });

  req.globalOptions = globalOptionsMap;
  req.globalOptionsPrivate = globalOptionsPrivateMap;

  return next();
}
