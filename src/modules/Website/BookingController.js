import axios from 'axios';

import { checkValidation } from '@/lib/checkValidation';
import { currentDateTime, PaymentCredentialFunction } from '@/lib/helper';

import { EVENT_DATA } from '../Event/EventController';

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

  const redirectUrl = `${BASEURL}/api/confirmTapPayment?reservation_id=${reservation_id}`;

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

  let tapPaymentObject = {
    amount: totalAmount.toFixed(2),
    //currency: event_data && event_data[0] ? event_data[0].curr_code : '',
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
  const { reservation_id } = req.query;
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
    await global.knexConnection('ms_reservation').where({ reservation_id }).update({
      is_booked: 'Y',
    });
    //do booking here
    return res.redirect(`${success_redirect_url}`);
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
