import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { addEditEvent, getEventList } from '@/modules/Event/EventController';

const router = Router();

export function EventRoutes() {
  router.post('/add-edit-event', checkSessionExist, addEditEvent);
  router.get('/getEventRoutes', checkSessionExist, getEventList);

  return router;
}
