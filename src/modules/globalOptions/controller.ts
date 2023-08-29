import type { Request, Response } from 'express';

import { setCachedData } from '@/cache';
import { getGlobalOptions } from '@/modules/globalOptions/service';

export async function getGlobalOptionsController(req: Request, res: Response) {
  console.log('dasdas');
  const data = await getGlobalOptions().catch(() => {
    return [];
  });

  const resp = {
    status: true,
    data,
  };

  if (res.cacheTTL) {
    setCachedData(res.cacheKey, res.cacheTag, res.cacheTTL, resp);
  }

  return res.status(200).json(resp);
}
