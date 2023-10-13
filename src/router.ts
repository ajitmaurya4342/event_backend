import { Router } from 'express';

import { globalOptionsRoutes } from '@/modules/globalOptions/routes';
import { LoginRoutes } from '@/modules/Login/LoginRoutes';

import { CinemaRoutes } from './modules/Cinema/CinemaRoutes';
import { CustomerRoutes } from './modules/Customer/CustomerRoutes';
import { EventRoutes } from './modules/Event/EventRoutes';
import { MasterRoutes } from './modules/Master/MasterRoutes';
import { UserRoutes } from './modules/User/UserRoutes';
import { WebsiteRoutes } from './modules/Website/WebsiteRoutes';
import { GuestRoutes } from './modules/Guest/GuestRoutes';

const router = Router();

export function getRootRouter(ops: AppRouterOptions) {
  // load all the routes of the modules here

  router.use('/', globalOptionsRoutes(ops));
  router.use('/', LoginRoutes());
  router.use('/admin', UserRoutes());
  router.use('/admin', CustomerRoutes());
  router.use('/admin', GuestRoutes());
  router.use('/admin', MasterRoutes());
  router.use('/admin', CinemaRoutes());
  router.use('/admin', EventRoutes());
  router.use('/api', WebsiteRoutes());

  return router;
}
