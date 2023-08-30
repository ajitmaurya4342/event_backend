import moment from 'moment';

export const currentDateTime = (date = null, format = 'YYYY-MM-DD HH:mm') => {
  let currentDateTime = moment().format(format);
  if (date) {
    currentDateTime = moment(date).format(currentDateTime);
  }
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
