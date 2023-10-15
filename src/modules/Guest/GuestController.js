import { checkValidation } from '@/lib/checkValidation';
import { dataReturnUpdate } from '@/lib/helper';
import { pagination } from '@/lib/pagination';

const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

export async function addEditGuest(req, res) {
  let reqbody = req.body;
  const { user_info } = req;
  const {
    guest_first_name,
    guest_last_name,
    guest_email,
    guest_phone_number,
    guest_is_active,
    guest_id,
  } = reqbody;
  let guest_id_new = guest_id || null;
  const isUpdate = guest_id ? true : false;
  let checkFields = ['guest_phone_number', 'guest_email'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkUserExist = await global
    .knexConnection('ms_guest_customers')
    .select(['guest_unique_id'])
    .where(builder => {
      builder.where({ guest_email });
      builder.where({ guest_phone_number });
    });

  let obj = {
    guest_first_name: guest_first_name || null,
    guest_last_name: guest_last_name || null,
    guest_email: guest_email || null,
    guest_phone_number: guest_phone_number || null,
    guest_is_active: guest_is_active || 'Y',
    ...dataReturnUpdate(user_info, isUpdate),
  };
  if (checkUserExist.length || guest_id_new) {
    guest_id_new = checkUserExist[0].guest_unique_id;
    await global
      .knexConnection('ms_guest_customers')
      .update(obj)
      .where({ guest_unique_id: guest_id_new });
    obj['guest_id'] = guest_id_new;
    obj['guest_unique_id'] = guest_id_new;
  } else {
    obj['guest_unique_id'] = uuidv4();
    obj['guest_id'] = obj['guest_unique_id'];
    obj['guest_unique_id'] = obj['guest_unique_id'];
    await global.knexConnection('ms_guest_customers').insert(obj);
  }

  return res.send({
    status: true,
    message: `Guest ${checkUserExist.length ? 'Updated' : 'Created'} Successfully`,
    Records: [obj],
  });
}

export async function getGuestList(req, res) {
  const reqbody = { ...req.query, ...req.body, ...req.params };
  const guest_id = reqbody.guest_id;
  const limit = req.query.limit ? req.query.limit : 100;
  const currentPage = req.query.currentPage ? req.query.currentPage : 1;

  const isWebsiteUser = req['is_website_user'] || false;
  if (isWebsiteUser) {
    let result = await checkValidation(['guest_id'], reqbody);
    if (!result.status) {
      return res.send(result);
    }
  }

  const UserList = await global
    .knexConnection('ms_guest_customers')
    .select([
      'guest_first_name',
      'guest_last_name',
      'guest_phone_number',
      'guest_email',
      'guest_unique_id as guest_id',
      'guest_is_active',
      'guest_id as g_id',
    ])
    .where(builder => {
      if (guest_id) {
        builder.where('guest_unique_id', '=', guest_id);
      }
      if (req.query.search) {
        builder.whereRaw(
          ` concat_ws(' ',guest_first_name,guest_last_name,guest_email,guest_phone_number) like '%${req.query.search}%'`,
        );
      }
    })
    .orderBy('g_id', 'desc')
    .paginate(pagination(limit, currentPage));

  return res.send({
    message: 'Guest List',
    status: true,
    Records: UserList,
  });
}
export async function addSubscriber(req, res) {
  let reqbody = req.body;

  console.log(reqbody, 'reqbody');
  const { subscriber_info } = req;

  console.log(subscriber_info, 'subscriber_info');

  const {
    subscriber_email,
    subscriber_name,
    subscriber_subject,
    subscriber_message,
    is_subscriber,
  } = reqbody;

  let checkFields = ['subscriber_email'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let checkSubscriberExist = await global
    .knexConnection('ms_subscriber')
    .select(['subscriber_email'])
    .where(builder => {
      builder.where({ subscriber_email });
    });

  let obj = {
    subscriber_email: subscriber_email || null,
    subscriber_name: subscriber_name || null,
    subscriber_subject: subscriber_subject || null,
    subscriber_message: subscriber_message || null,
    is_subscriber: is_subscriber || 'Y',
    ...dataReturnUpdate(subscriber_info),
  };
  if (checkSubscriberExist.length && is_subscriber == 'Y') {
  } else {
    await global.knexConnection('ms_subscriber').insert(obj);
  }
  return res.send({
    status: true,
    message: `${
      is_subscriber == 'N'
        ? 'Response Received. We will get back to you soon !'
        : checkSubscriberExist.length
        ? 'Already Subscribed'
        : 'Subscribed Successfully'
    } `,
    Records: [obj],
  });
}
