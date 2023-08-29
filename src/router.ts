import { Router } from 'express';

import { globalOptionsRoutes } from '@/modules/globalOptions/routes';
import { loginRoutes } from '@/modules/Login/LoginRoutes';

const router = Router();

export function getRootRouter(ops: AppRouterOptions) {
  // load all the routes of the modules here

  router.use('/', globalOptionsRoutes(ops));
  router.use('/', loginRoutes());

  return router;
}
