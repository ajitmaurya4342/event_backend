import type { NextFunction, Request, Response } from 'express';

const jwtDecode = require('jwt-decode');

export async function checkSessionExist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: false,
      isAuthorization: true,
      message: 'You are not authorized',
    });
  } else {
    const { token } = jwtDecode(req.headers.authorization);
    const checkTokenExist = await global
      .knexConnection('user_token')
      .select([
        'user_name',
        'first_name',
        'last_name',
        'email',
        'role_name',
        'users.user_id',
        'users.role_id',
      ])
      .leftJoin('users', 'user_token.user_id', 'users.user_id')
      .leftJoin('ms_roles', 'ms_roles.role_id', 'users.role_id')
      .where({
        multi_token_id: token,
      });

    if (checkTokenExist.length) {
      req['user_info'] = {
        ...checkTokenExist[0],
      };
      req['is_website_user'] = false;
      return next();
    } else {
      return res.status(403).json({
        status: false,
        isAuthorization: true,
        message: 'You are not authorized',
      });
    }
  }
}

export async function checkWebsiteSessionExist(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: false,
      isAuthorization: true,
      message: 'You are not authorized',
    });
  } else {
    const { token } = jwtDecode(req.headers.authorization);
    const checkTokenExist = await global
      .knexConnection('user_token')
      .select([
        'user_name',
        'first_name',
        'last_name',
        'email',
        'role_name',
        'users.user_id',
        'users.role_id',
      ])
      .leftJoin('users', 'user_token.user_id', 'users.user_id')
      .leftJoin('ms_roles', 'ms_roles.role_id', 'users.role_id')
      .where({
        multi_token_id: token,
        'users.role_id': 3,
      });

    if (checkTokenExist.length) {
      req['user_info'] = {
        ...checkTokenExist[0],
      };
      req['is_website_user'] = true;
      return next();
    } else {
      return res.status(403).json({
        status: false,
        isAuthorization: true,
        message: 'You are not authorized',
      });
    }
  }
}
