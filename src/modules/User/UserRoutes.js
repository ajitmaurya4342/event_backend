import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { addEdtUser, getUserList } from '@/modules/User/UserController';

const router = Router();

export function UserRoutes() {
  router.post('/add-edit-users', checkSessionExist, addEdtUser);
  router.get('/getuserlist', checkSessionExist, getUserList);

  return router;
}
