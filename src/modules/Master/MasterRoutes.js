import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import {
  addEditCities,
  addEditCountries,
  getCityList,
  getCountryList,
} from '@/modules/Master/MasterController';

const router = Router();

export function MasterRoutes() {
  router.post('/add-edit-countries', checkSessionExist, addEditCountries);
  router.get('/getcountrylist', checkSessionExist, getCountryList);

  router.post('/add-edit-cities', checkSessionExist, addEditCities);
  router.get('/getcitylist', checkSessionExist, getCityList);

  return router;
}
