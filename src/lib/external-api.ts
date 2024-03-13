const payment_api_base_url =
  process.env.KOWRI_EP || 'https://posapi.usebillbox.com';

export const externalApis = {
  payment: {
    baseUrl: payment_api_base_url,
    payNow: () => payment_api_base_url + '/webpos/payNow',
    checkStatus: () => payment_api_base_url + `/webpos/checkPaymentStatus`,
  },
};
