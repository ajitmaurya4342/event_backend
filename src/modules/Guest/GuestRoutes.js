import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { addEditGuest, getGuestList } from '@/modules/Guest/GuestController';

const router = Router();

export function GuestRoutes() {
  router.post('/add-edit-guest', checkSessionExist, addEditGuest);
  router.get('/getGuestList', checkSessionExist, getGuestList);
  return router;
}
