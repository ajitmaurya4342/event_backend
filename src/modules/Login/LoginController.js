import { checkValidation } from '@/lib/checkValidation';

var bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
var jwt_token = require('jsonwebtoken');

export const CREATE_TOKEN_FOR_USER = async ({ user_id, role_id }) => {
  const random = uuidv4();
  await global.knexConnection('user_token').where({ user_id }).del();
  let create_user_token = {
    user_id,
    role_id,
    multi_token_id: random,
    user_token_is_active: 'Y',
  };
  await global.knexConnection('user_token').insert(create_user_token);
  let token = jwt_token.sign({ token: random }, process.env.JWTSECRET || 'welcomeuser');
  return token;
};

export async function login(req, res) {
  let reqbody = req.body;
  const { user_name, password } = reqbody;
  let checkFields = ['user_name', 'password'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkUserExist = await global
    .knexConnection('users')
    .select([
      'user_name',
      'first_name',
      'last_name',
      'email',
      'role_name',
      'password',
      'users.user_id',
      'users.role_id',
    ])
    .leftJoin('ms_roles', 'ms_roles.role_id', 'users.role_id')
    .where({
      user_name,
    })
    .orWhere({ email: user_name });

  if (checkUserExist.length) {
    bcrypt.compare(password, checkUserExist[0].password, async function (err, result) {
      if (result == true) {
        let token = await CREATE_TOKEN_FOR_USER({
          user_id: checkUserExist[0].user_id,
          role_id: checkUserExist[0].role_id,
        });
        delete checkUserExist[0].password;
        return res.status(200).json({
          message: 'Login Successfully',
          status: true,
          Records: checkUserExist,
          access_token: token,
        });
      } else {
        return res.status(200).json({
          error: err,
          message: "Password doesn't match.",
          status: false,
        });
      }
    });
  } else {
    return res.send({
      status: false,
      message: 'Invalid Credential',
    });
  }
}

export async function checkLogin(req, res) {
  const { user_info } = req;
  return res.send({
    status: true,
    Records: [user_info],
  });
}
