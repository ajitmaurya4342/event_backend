import axios from 'axios';

export async function tapPaymentCheckout(req, res) {
  let data = JSON.stringify(req.body);
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://api.tap.company/v2/charges',
    headers: {
      Authorization: `Bearer sk_test_GslycEdgJNQCwSRxKYpW5zmB`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    data: data,
  };
  axios
    .request(config)
    .then(response => {
      console.log(response, 'response');
      res.send({
        status: true,
        data: response.data,
      }); // send data
    })
    .catch(error => {
      console.log(error, 'error');
      res.send({
        status: false,
        data: error,
      }); // send data
    });
}

export async function confirmTapPayment(req, res) {
  const success_redirect_url = `http://127.0.0.1:5173`;
  const failed_redirect_url = `http://127.0.0.1:5173`;
  console.log(req.query, 'tap pay id');
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://api.tap.company/v2/charges/${req.query.tap_id}`,
    headers: {
      Authorization: 'Bearer sk_test_GslycEdgJNQCwSRxKYpW5zmB',
      Accept: 'application/json',
    },
  };
  let getPaymentStatus = await axios.request(config);
  console.log(getPaymentStatus, 'payment response');
  if (
    getPaymentStatus.data.status == 'CAPTURED' ||
    getPaymentStatus.data.status == 'captured'
  ) {
    console.log(getPaymentStatus.data.status, 'getPaymentStatus.data.status');
    //do booking here
    return success_redirect_url;
  } else {
    return failed_redirect_url;
  }
}
