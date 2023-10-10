import { Router } from 'express';

import {
  checkSessionExist,
  checkWebsiteSessionExist,
} from '@/middlewares/checkSessionExist';
import { getActiveEventList, getEventList } from '@/modules/Event/EventController';
import {
  getBannerList,
  getCountryList,
  getLanguageList,
} from '@/modules/Master/MasterController';
import {
  confirmTapPayment,
  tapPaymentCheckout,
} from '@/modules/Website/BookingController';

const router = Router();

export function WebsiteRoutes() {
  router.get('/getCountryList', checkWebsiteSessionExist, getCountryList);
  router.get('/getBannerList', checkWebsiteSessionExist, getBannerList);
  router.get('/getLanguageList', checkWebsiteSessionExist, getLanguageList);
  router.get('/getEventList', checkWebsiteSessionExist, getActiveEventList);
  router.get('/getEventListById/:event_id', checkWebsiteSessionExist, getEventList);
  router.post('/tapPaymentCheckout', checkWebsiteSessionExist, tapPaymentCheckout);
  router.get('/confirmTapPayment', confirmTapPayment);

  return router;
}
