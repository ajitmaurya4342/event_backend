import moment from 'moment';

var momentTimeZone = require('moment-timezone');

export const currentDateTime = (
  date = null,
  format = 'YYYY-MM-DD HH:mm',
  TIME_ZONE_SET = '',
) => {
  const { TIME_ZONE } = global.globalOptions;
  let currentDateTime = moment().format(format);
  const TIME_ZON_VALUE = TIME_ZONE_SET || TIME_ZONE;

  if (TIME_ZON_VALUE) {
    currentDateTime = momentTimeZone().tz(TIME_ZON_VALUE).format(format);
  }
  if (date) {
    currentDateTime = moment(date).format(format);
  }
  console.log(currentDateTime, TIME_ZON_VALUE);
  return currentDateTime;
};

export const dataReturnUpdate = (userInfo, isUpdate = false) => {
  let obj = {};
  if (!userInfo) {
    return obj;
  }
  console.log(userInfo);
  if (isUpdate) {
    obj['updated_at'] = currentDateTime();
    obj['updated_by'] = userInfo.user_id;
  } else {
    obj['created_at'] = currentDateTime();
    obj['created_by'] = userInfo.user_id;
  }
  return obj;
};

export const PaymentCredentialFunction = async ({ cinema_id, pm_id }) => {
  let dataSuccess = {
    status: true,
    data: {},
  };

  let dataFail = {
    status: false,
    data: {},
  };

  if (!pm_id) {
    return dataFail;
  }

  let getPaymentCredential = await global
    .knexConnection('ms_payment_mode')
    .where({ pm_id })
    .where(builder => {
      if (cinema_id) {
        builder.where('cinema_id', cinema_id);
      }
    });

  if (getPaymentCredential.length && getPaymentCredential[0].credential) {
    dataSuccess.data = JSON.parse(getPaymentCredential[0].credential);
    return dataSuccess;
  } else {
    return dataFail;
  }
};
