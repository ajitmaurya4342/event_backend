import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import {
  addEditBanner,
  addEditCities,
  addEditCountries,
  addEditCurrency,
  addEditGenre,
  addEditLanguages,
  addEditSeatType,
  getBannerList,
  getCityList,
  getCountryList,
  getCurrencyList,
  getGenreList,
  getLanguageList,
  getSeatTypeList,
  getTimeZoneList,
} from '@/modules/Master/MasterController';

const fileMulter = require('@/modules/Master/FileUploadController');

const router = Router();

export function MasterRoutes() {
  router.post('/add-edit-countries', checkSessionExist, addEditCountries);
  router.get('/getcountrylist', checkSessionExist, getCountryList);

  router.post('/add-edit-cities', checkSessionExist, addEditCities);
  router.get('/getcitylist', checkSessionExist, getCityList);

  router.post('/add-edit-languages', checkSessionExist, addEditLanguages);
  router.get('/getlanguageslist', checkSessionExist, getLanguageList);

  router.post('/add-edit-genres', checkSessionExist, addEditGenre);
  router.get('/getgenreslist', checkSessionExist, getGenreList);

  router.post('/add-edit-seattype', checkSessionExist, addEditSeatType);
  router.get('/getseattypelist', checkSessionExist, getSeatTypeList);

  router.post('/add-edit-currency', checkSessionExist, addEditCurrency);
  router.get('/getcurrencylist', checkSessionExist, getCurrencyList);

  router.post('/add-edit-banner', checkSessionExist, addEditBanner);
  router.get('/getbannerlist', checkSessionExist, getBannerList);

  router.get('/gettimezonelist', checkSessionExist, getTimeZoneList);
  router.route('/uploadimage').post(fileMulter.uploadImageController);
  return router;
}
