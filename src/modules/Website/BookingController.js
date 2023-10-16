import axios from 'axios';
import ejs from 'ejs';
import moment from 'moment';

import { checkValidation } from '@/lib/checkValidation';
import { currentDateTime, PaymentCredentialFunction, sendEmail } from '@/lib/helper';

import { EVENT_DATA } from '../Event/EventController';

const path = require('path');

const fs = require('fs');

export async function tapPaymentCheckout(req, res) {
  let BASEURL = ``;
  // @ts-ignore
  let reqbody = req.body;
  const { user_info } = req;
  const {
    reservation_id,
    customer_email,
    customer_mobile,
    country_code,
    is_guest,
    success_frontend_url,
    failed_frontend_url,
  } = reqbody;
  let checkFields = [
    'reservation_id',
    'customer_email',
    'customer_mobile',
    'is_guest',
    'success_frontend_url',
    'failed_frontend_url',
  ];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  const paymentDetailC = await global
    .knexConnection('ms_payment_booking_detail')
    .where({
      reservation_id,
    });

  if (paymentDetailC.length) {
    return res.send({
      status: false,
      message: 'Payment Already Initiated with reservation id',
    });
  }

  const checkReservation = await global.knexConnection('ms_reservation').where({
    is_reserved: 'Y',
    reservation_id,
  });

  if (checkReservation.length == 0) {
    return res.send({
      status: false,
      message: 'Seat Already Reserved or Booked',
    });
  }

  const event_data_all = await EVENT_DATA({
    event_id: checkReservation[0].event_id,
    event_sch_id: checkReservation[0].event_sch_id,
  });

  let event_data = event_data_all.Records;

  const [BACKEND_URL] = await global.knexConnection('global_options').where({
    go_key: 'BASE_URL_BACKEND',
  });

  BASEURL = BACKEND_URL.go_value;

  const redirectUrl = `${BASEURL}/api/confirmTapPayment?reservation_id=${reservation_id}&event_token=${req['token']}`;

  // @ts-ignore
  const payment_credential = await PaymentCredentialFunction({
    pm_id: '1',
  });

  if (payment_credential.false) {
    return res.send({
      status: false,
      message: 'Invalid Payment Mode',
    });
  }

  const { MERCHANT_ID, SOURCE_ID, URL, PAYTAP_SECRET_KEY } = payment_credential.data;

  if (!MERCHANT_ID || !SOURCE_ID || !URL || !PAYTAP_SECRET_KEY) {
    return res.send({
      status: false,
      message: 'Missing Payment Data',
      data: payment_credential.data,
    });
  }

  let totalAmount = 0;
  checkReservation.map(z => {
    totalAmount += parseFloat(z.seat_price);
  });
  let paymentCurrency = event_data && event_data[0] ? event_data[0].curr_code : '';

  console.log(paymentCurrency, 'paymentCurrency');
  let tapPaymentObject = {
    amount: totalAmount.toFixed(2),
    // currency: paymentCurrency,
    currency: 'KWD',
    threeDSecure: true,
    save_card: false, //based on your choice
    customer_initiated: true,
    description: '',
    statement_descriptor: 'Sample',
    metadata: {
      udf1: 'test 1',
      udf2: 'test 2',
    },
    reference: {
      transaction: 'trx_' + reservation_id,
      order: reservation_id,
    },
    receipt: {
      email: true,
      sms: false,
    },
    customer: {
      first_name: '-',
      last_name: '-',
      email: customer_email,
      phone: {
        country_code: country_code,
        number: customer_mobile,
      },
    },
    merchant: {
      id: MERCHANT_ID,
    },
    source: {
      id: SOURCE_ID,
    },
    post: {
      url: '',
    },
    redirect: {
      url: redirectUrl,
    },
  };
  let data = JSON.stringify(tapPaymentObject);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: URL,
    headers: {
      Authorization: `Bearer ${PAYTAP_SECRET_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: data,
  };
  axios
    // @ts-ignore
    .request(config)
    .then(async response => {
      let currentDateTimeNew = currentDateTime(
        null,
        'YYYY-MM-DD HH:mm:ss',
        event_data[0].tz_name,
      );
      let insertPaymentDetail = {
        reservation_id,
        success_frontend_url,
        failed_frontend_url,
        email: customer_email,
        phone_number: customer_mobile,
        country_code: country_code,
        is_guest: is_guest,
        created_at: currentDateTimeNew,
        pm_id: 1,
      };

      await global
        .knexConnection('ms_payment_booking_detail')
        .insert(insertPaymentDetail);

      return res.send({
        status: true,
        data: response.data,
      }); // send data
    })
    .catch(error => {
      return res.send({
        status: false,
        data: error,
      }); // send data
    });
}

export async function confirmTapPayment(req, res) {
  const { reservation_id, event_token } = req.query;
  console.log(reservation_id, 'reservation_id');
  const detailPayment = await global
    .knexConnection('ms_payment_booking_detail')
    .where({ reservation_id });
  const reservation_detail = await global
    .knexConnection('ms_reservation')
    .where({ reservation_id });

  if (!detailPayment.length && !reservation_detail.length) {
    return res.send({ status: false, message: 'Detail Not Found' });
  }

  const { success_frontend_url, failed_frontend_url } = detailPayment[0];
  const success_redirect_url = success_frontend_url;
  const failed_redirect_url = failed_frontend_url;

  // @ts-ignore
  const payment_credential = await PaymentCredentialFunction({
    pm_id: '1',
  });

  if (payment_credential.false) {
    return res.send({
      status: false,
      message: 'Invalid Payment Mode',
    });
  }

  const { MERCHANT_ID, SOURCE_ID, URL, PAYTAP_SECRET_KEY } = payment_credential.data;

  if (!MERCHANT_ID || !SOURCE_ID || !URL || !PAYTAP_SECRET_KEY) {
    return res.send({
      status: false,
      message: 'Missing Payment Data',
    });
  }

  let config2 = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${URL}/${req.query.tap_id}`,
    headers: {
      Authorization: `Bearer ${PAYTAP_SECRET_KEY}`,
      Accept: 'application/json',
    },
  };

  // @ts-ignore
  let getPaymentStatus = await axios.request(config2);
  console.log(getPaymentStatus, 'payment response');
  if (
    getPaymentStatus.data.status == 'CAPTURED' ||
    getPaymentStatus.data.status == 'captured'
  ) {
    console.log(getPaymentStatus.data.status, 'getPaymentStatus.data.status');

    await global
      .knexConnection('ms_payment_booking_detail')
      .where({ reservation_id })
      .update({
        is_booked: 'Y',
        payment_capture: JSON.stringify(getPaymentStatus.data),
      });

    let BASEURL = ``;
    const [BACKEND_URL] = await global.knexConnection('global_options').where({
      go_key: 'BASE_URL_BACKEND',
    });
    BASEURL = BACKEND_URL.go_value;

    const config = {
      method: 'post',
      url: `${BASEURL}/api/createTransation/${reservation_id}`,
      headers: {
        Authorization: event_token,
      },
    };
    const transactionResponse = await axios(config);
    if (
      transactionResponse &&
      transactionResponse.data &&
      transactionResponse.data.status
    ) {
      console.log(transactionResponse.data, 'done');
      return res.redirect(
        `${success_redirect_url}/${transactionResponse.data.booking_code}`,
      );
    } else {
      console.log('failed');
    }

    console.log(res.status);
  } else {
    await global
      .knexConnection('ms_payment_booking_detail')
      .where({ reservation_id })
      .update({
        payment_capture: JSON.stringify(getPaymentStatus.data),
      });
    return res.redirect(`${failed_redirect_url}`);
  }
}

export async function createTransation(req, res) {
  console.log(req.query, 'create transaction');
  let reqbody = { ...req.body, ...req.params };
  const { user_info } = req;
  const isWebsiteUser = req['is_website_user'] || false;
  const { reservation_id, payment_mode_id } = reqbody;
  let checkFields = ['reservation_id', 'payment_mode_id'];
  let result = await checkValidation(checkFields, reqbody);
  if (!result.status) {
    return res.send(result);
  }

  let getReservationDetail = await global.knexConnection('ms_reservation').where({
    reservation_id,
    is_reserved: 'Y',
  });
  let getPaymentDetail = [];
  if (isWebsiteUser) {
    getPaymentDetail = await global
      .knexCnnection('ms_payment_booking_detail')
      .select(
        'email',
        'phone_number',
        'country_code',
        'is_booked',
        'is_guest',
        'payment_mode_name',
      )
      .leftJoin(
        'ms_payment_mode',
        'ms_payment_mode.pm_id',
        'ms_payment_booking_detail.pm_id',
      )
      .where({
        reservation_id,
        is_booked: 'Y',
      });
    if (!getPaymentDetail.length) {
      return res.send({
        status: false,
        Records: `Payment Not Done from Website`,
      });
    }
  }

  if (!getReservationDetail.length) {
    return res.send({
      status: false,
      Records: `Seat Released or Booked`,
    });
  }
  let currentDateTimeNew = currentDateTime(
    null,
    'YYYY-MM-DD HH:mm:ss',
    getReservationDetail[0].timezone_name,
  );

  let event_data_all = await EVENT_DATA({
    event_id: getReservationDetail[0].event_id,
    event_sch_id: getReservationDetail[0].event_sch_id,
  });

  let event_data = event_data_all.Records[0];

  let insertObj = {
    event_id: getReservationDetail[0].event_id,
    schedule_id: getReservationDetail[0].event_sch_id,
    c_email:
      getPaymentDetail[0] && getPaymentDetail[0].email
        ? getPaymentDetail[0].email
        : null,
    c_country_code:
      getPaymentDetail[0] && getPaymentDetail[0].country_code
        ? getPaymentDetail[0].country_code
        : null,
    is_guest:
      getPaymentDetail[0] && getPaymentDetail[0].is_guest
        ? getPaymentDetail[0].is_guest
        : null,
    c_phone_number:
      getPaymentDetail[0] && getPaymentDetail[0].phone_number
        ? getPaymentDetail[0].phone_number
        : null,
    event_name: event_data.event_name,
    cinema_name: event_data.cinema_name,
    cinema_email: event_data.cinema_email || null,
    city_name: event_data.city_name || null,
    country: event_data.country_name || null,
    timezone: event_data.tz_name || null,
    currency: event_data.curr_code || null,
    payment_mode_id:
      getPaymentDetail[0] && getPaymentDetail[0].pm_id
        ? getPaymentDetail[0].pm_id
        : null,
    payment_mode:
      getPaymentDetail[0] && getPaymentDetail[0].payment_mode_name
        ? getPaymentDetail[0].payment_mode_name
        : null,
    booking_type_name: isWebsiteUser ? 'Website' : 'Box Office',
    event_date: moment(event_data.event_sch_array[0].sch_date).format('YYYY-MM-DD'),
    event_time: moment(event_data.event_sch_array[0].sch_time).format('YYYY-MM-DD'),
    booking_date_time: currentDateTimeNew,
    created_by: (user_info && user_info.user_id) || null,
    reservation_id,
  };

  let insertBookingId = await global.knexConnection('ms_booking').insert(insertObj);

  let transaction_array = [];
  let seatNames = [];
  let totalAmount = 0;
  getReservationDetail.map(z => {
    seatNames.push(z.seat_name);
    // @ts-ignore
    totalAmount += parseFloat(z.seat_price).toFixed(3);
    let obj = {
      booking_id: insertBookingId[0],
      seat_name: z.seat_name,
      seat_type: z.seat_type,
      seat_group_id: z.seat_group_id,
      seat_price: z.seat_price,
    };
    transaction_array.push({ ...obj });
  });

  await global.knexConnection('ms_booking_transaction').insert(transaction_array);

  let booking_code = 'TKT';
  let prefix_array = ['00000', '0000', '000', '00', '0'];
  let string_length = String(insertBookingId[0]).length - 1;
  let booking_number_new = prefix_array[string_length]
    ? `${prefix_array[string_length]}${insertBookingId[0]}`
    : insertBookingId[0];
  booking_code += booking_number_new;

  let emailData = {
    booking_id: booking_code,
    booking_date_time: insertObj.booking_date_time,
    event_name: insertObj.event_name,
    cinema_name: insertObj.city_name,
    city_name: insertObj.city_name,
    event_date_time: moment(insertObj.event_date + ' ' + insertObj.event_time).format(
      'YYYY-MM-DD HH:mm',
    ),
    seats: seatNames.join(', '),
    totalPrice: totalAmount,
    currency: insertObj.currency,
  };

  await global.knexConnection('ms_reservation').where({ reservation_id }).update({
    is_booked: 'Y',
  });

  await global
    .knexConnection('ms_booking')
    .where({ booking_id: insertBookingId[0] })
    .update({
      booking_code,
    });

  await sendTicketEmail(emailData);
  return res.send({
    status: true,
    message: 'transaction created',
    booking_code,
  });
}
export const sendTicketEmail = async reqbody => {
  let templetePath =
    path.join(__dirname, '../../../../') + 'src/modules/templetes/confirmTicket.ejs';
  console.log(templetePath, 'reqbody');

  let ticketTemplate = fs.readFileSync(templetePath, 'utf8');
  let emailHtml = await ejs.render(ticketTemplate, {
    emailData: reqbody.emailData,
  });
  await sendEmail('jitendra@gokozo.com', 'Tktfox Ticket', emailHtml, null);
  return {
    message: 'Email Sent',
    status: true,
  };
};
