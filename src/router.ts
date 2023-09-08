import { Router } from 'express';

import { globalOptionsRoutes } from '@/modules/globalOptions/routes';
import { LoginRoutes } from '@/modules/Login/LoginRoutes';

import { CinemaRoutes } from './modules/Cinema/CinemaRoutes';
import { EventRoutes } from './modules/Event/EventRoutes';
import { MasterRoutes } from './modules/Master/MasterRoutes';
import { UserRoutes } from './modules/User/UserRoutes';

const router = Router();

export function getRootRouter(ops: AppRouterOptions) {
  // load all the routes of the modules here

  router.use('/', globalOptionsRoutes(ops));
  router.use('/', LoginRoutes());
  router.use('/admin', UserRoutes());
  router.use('/admin', MasterRoutes());
  router.use('/admin', CinemaRoutes());
  router.use('/admin', EventRoutes());

  return router;
}
