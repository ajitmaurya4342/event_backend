import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { addEditCountries, getCountryList } from '@/modules/Master/MasterController';

const router = Router();

export function MasterRoutes() {
  router.post('/add-edit-countries', checkSessionExist, addEditCountries);
  router.get('/getcountrylist', checkSessionExist, getCountryList);

  return router;
}
