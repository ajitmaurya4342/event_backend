import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

var bcrypt = require('bcryptjs');

export async function addEdtUser(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    first_name,
    last_name,
    email,
    mobile_number,
    employee_code,
    user_name,
    password,
    user_is_active,
    role_id,
    user_id,
  } = reqbody;
  const isUpdate = user_id ? true : false;
  let checkFields = [
    'first_name',
    'last_name',
    'mobile_number',
    'user_name',
    'password',
    'user_is_active',
    'role_id',
    'email',
  ];
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
    .where(builder => {
      builder.where({ user_name });
      builder.orWhere({ email: user_name });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('user_id', [user_id]);
      }
    });

  if (checkUserExist.length) {
    return res.status(200).json({
      message: 'User Already Exist',
      status: false,
      Records: checkUserExist,
    });
  } else {
    let obj = {
      first_name: first_name || null,
      last_name: last_name || null,
      email: email || null,
      mobile_number: mobile_number || null,
      employee_code: employee_code || null,
      user_name: user_name || null,
      user_is_active: user_is_active || 'Y',
      role_id: role_id || 1,
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global.knexConnection('users').update(obj).where({ user_id });
    } else {
      obj['password'] = bcrypt.hashSync(password, 10);
      await global.knexConnection('users').insert(obj);
    }

    return res.send({
      status: true,
      message: `User ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      obj,
    });

    if (user_id) {
    }
  }
}

export async function getUserList(req, res) {
  const reqbody = { ...req.query, ...req.body };
  const user_id = reqbody.user_id;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const UserList = await global
    .knexConnection('users')
    .select([
      'user_name',
      'first_name',
      'last_name',
      'mobile_number',
      'email',
      'role_name',
      'users.user_id',
      'users.user_is_active',
    ])
    .leftJoin('ms_roles', 'ms_roles.role_id', 'users.role_id')
    .where(builder => {
      if (user_id) {
        builder.where('user_id', '=', user_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',first_name,last_name,employee_code,email,mobile_number,user_name) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('user_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'User List',
    status: true,
    Records: UserList,
  });
}
