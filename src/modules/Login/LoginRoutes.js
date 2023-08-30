import { Router } from 'express';

import { checkSessionExist } from '@/middlewares/checkSessionExist';
import { checkLogin, login } from '@/modules/Login/LoginController';

const router = Router();

export function LoginRoutes() {
  router.get('/login', login);
  router.get('/check-login-access', checkSessionExist, checkLogin);

  return router;
}
