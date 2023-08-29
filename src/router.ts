import { Router } from 'express';

import { globalOptionsRoutes } from '@/modules/globalOptions/routes';

const router = Router();

export function getRootRouter(ops: AppRouterOptions) {
  // load all the routes of the modules here

  router.use('/', globalOptionsRoutes(ops));

  return router;
}
