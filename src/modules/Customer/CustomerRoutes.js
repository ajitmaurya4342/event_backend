import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import {
  addEditCustomer,
  getCustomerList,
} from '@/modules/Customer/CustomerController';

const router = Router();

export function CustomerRoutes() {
  router.post('/add-edit-customer', checkSessionExist, addEditCustomer);
  router.get('/getcustomerlist', checkSessionExist, getCustomerList);

  return router;
}
