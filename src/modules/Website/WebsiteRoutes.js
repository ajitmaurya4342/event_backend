import { Router } from 'express';

import {
  checkSessionExist,
  checkWebsiteSessionExist,
} from '@/middlewares/checkSessionExist';
import { getActiveEventList } from '@/modules/Event/EventController';
import {
  getBannerList,
  getCountryList,
  getLanguageList,
} from '@/modules/Master/MasterController';

const router = Router();

export function WebsiteRoutes() {
  router.get('/getCountryList', checkWebsiteSessionExist, getCountryList);
  router.get('/getBannerList', checkWebsiteSessionExist, getBannerList);
  router.get('/getLanguageList', checkWebsiteSessionExist, getLanguageList);
  router.get('/getEventList', checkWebsiteSessionExist, getActiveEventList);

  return router;
}
