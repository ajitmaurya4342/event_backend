import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { addEditCinema, getCinemaList } from '@/modules/Cinema/CinemaController';

const fileMulter = require('@/modules/Master/FileUploadController');

const router = Router();

export function CinemaRoutes() {
  router.post('/add-edit-cinema', checkSessionExist, addEditCinema);
  router.get('/getcinemalist', checkSessionExist, getCinemaList);

  return router;
}
