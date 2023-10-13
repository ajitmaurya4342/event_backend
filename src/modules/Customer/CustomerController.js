import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

export async function addEditCustomer(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    customer_is_active,
    customer_id,
  } = reqbody;
  const isUpdate = customer_id ? true : false;
  let checkFields = ['first_name', 'last_name', 'phone_number', 'email', 'password'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkUserExist = await global
    .knexConnection('ms_customers')
    .select(['first_name'])
    .where(builder => {
      builder.where({ email });
      builder.orWhere({ phone_number });
    })
    .andWhere(builder => {
      if (isUpdate) {
        builder.whereNotIn('customer_unique_id', [customer_id]);
      }
    });

  if (checkUserExist.length) {
    return res.status(200).json({
      message: 'Customer Already Exist',
      status: false,
      Records: checkUserExist,
    });
  } else {
    let obj = {
      first_name: first_name || null,
      last_name: last_name || null,
      email: email || null,
      phone_number: phone_number || null,
      customer_is_active: customer_is_active || 'Y',
      ...dataReturnUpdate(user_info, isUpdate),
    };
    if (isUpdate) {
      await global
        .knexConnection('ms_customers')
        .update(obj)
        .where({ customer_unique_id: customer_id });
    } else {
      obj['password'] = bcrypt.hashSync(password, 10);
      obj['customer_unique_id'] = uuidv4();
      await global.knexConnection('ms_customers').insert(obj);
    }

    return res.send({
      status: true,
      message: `Customer ${isUpdate ? 'Updated' : 'Created'} Successfully`,
      Records: [obj],
    });
  }
}

export async function getCustomerList(req, res) {
  const reqbody = { ...req.query, ...req.body, ...req.params };
  const customer_id = reqbody.customer_id;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const isWebsiteUser = req['is_website_user'] || false;
  if (isWebsiteUser) {
    let result = await checkValidation(['customer_id'], reqbody);
    if (!result.status) {
      return res.send(result);
    }
  }

  const UserList = await global
    .knexConnection('ms_customers')
    .select([
      'first_name',
      'last_name',
      'phone_number',
      'email',
      'customer_unique_id as customer_id',
      'customer_is_active',
      'customer_id as cust_id',
    ])
    .where(builder => {
      if (customer_id) {
        builder.where('customer_unique_id', '=', customer_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',first_name,last_name,email,phone_number) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('cust_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Customer List',
    status: true,
    Records: UserList,
  });
}

export async function signInCustomer(req, res) {
  let reqbody = req.body;
  const { user_name, password } = reqbody;
  let checkFields = ['user_name', 'password'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkUserExist = await global
    .knexConnection('ms_customers')
    .select([
      'first_name',
      'last_name',
      'phone_number',
      'password',
      'email',
      'customer_unique_id as customer_id',
      'customer_is_active',
      'customer_id as cust_id',
    ])
    .where({ email: user_name });

  if (checkUserExist.length) {
    bcrypt.compare(password, checkUserExist[0].password, async function (err, result) {
      if (result == true) {
        return res.status(200).json({
          message: 'Signin Successfully',
          status: true,
          Records: checkUserExist,
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
