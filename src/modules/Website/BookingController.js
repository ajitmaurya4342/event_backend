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
  console.log(req, 'req jitu');
}
