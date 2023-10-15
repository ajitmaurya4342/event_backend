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

import {
  addEditCustomer,
  getCustomerList,
  signInCustomer,
} from '../Customer/CustomerController';
import { addEditGuest, addSubscriber } from '../Guest/GuestController';
import {
  addReservationSeat,
  allReserveSeatBySchedule,
  getReservationSeat,
  releaseSeats,
  resetReserveTime,
} from './WebsiteController';

const router = Router();

export function WebsiteRoutes() {
  router.get('/getCountryList', checkWebsiteSessionExist, getCountryList);
  router.get('/getBannerList', checkWebsiteSessionExist, getBannerList);
  router.get('/getLanguageList', checkWebsiteSessionExist, getLanguageList);
  router.get('/getEventList', checkWebsiteSessionExist, getActiveEventList);
  router.get('/getEventListById/:event_id', checkWebsiteSessionExist, getEventList);
  router.post('/signup-customer', checkWebsiteSessionExist, addEditCustomer);
  router.post('/signIn', checkWebsiteSessionExist, signInCustomer);
  router.get(
    '/getCustomerDetail/:customer_id',
    checkWebsiteSessionExist,
    getCustomerList,
  );
  router.post('/tapPaymentCheckout', checkWebsiteSessionExist, tapPaymentCheckout);
  router.get('/confirmTapPayment', confirmTapPayment);
  router.post('/reserveSeats', checkWebsiteSessionExist, addReservationSeat);
  router.get(
    '/getReservationDetails/:reservation_id',
    checkWebsiteSessionExist,
    getReservationSeat,
  );
  router.get(
    '/resetReserveTimer/:reservation_id',
    checkWebsiteSessionExist,
    resetReserveTime,
  );
  router.get('/seatRelease/:reservation_id', checkWebsiteSessionExist, releaseSeats);
  router.get(
    '/getAllBlockedSeatsBySchedule/:event_sch_id',
    checkWebsiteSessionExist,
    allReserveSeatBySchedule,
  );
  router.post('/guestCheckout', checkWebsiteSessionExist, addEditGuest);
  router.post('/customerSubscribe', checkWebsiteSessionExist, addSubscriber);
  return router;
}
