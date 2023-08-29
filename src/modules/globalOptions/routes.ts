import { getHeapSnapshot } from 'v8';

import { Router } from 'express';

import { getGlobalOptionsController } from '@/modules/globalOptions/controller';

const router = Router();

const NANOSECONDS_IN_MILLISECOND = 1e6;

export function globalOptionsRoutes(ops: AppRouterOptions) {
  router.get(
    '/global-options',
    // middleware if any
    getGlobalOptionsController,
  );

  router.get('/api/v1/debug/heapdump', (req, res) => {
    if (req.get('Authorization') !== 'verysupersecure')
      return res.status(401).send('Unauthorized');

    const snapshot = getHeapSnapshot();
    snapshot.pipe(res);
  });

  return router;
}
