import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { getTransactionList } from '@/modules/Website/BookingController';

const router = Router();

export function ReportRoutes() {
  router.get('/getTransactionList', checkSessionExist, getTransactionList);
  return router;
}
