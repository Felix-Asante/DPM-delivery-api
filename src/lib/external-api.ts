import { ENV } from 'src/app.environment';

const payment_api_base_url = ENV.KOWRI_EP;
const paystack_api_base_url = ENV.PAYSTACK_BASE_URL;

export const externalApis = {
  payment: {
    baseUrl: payment_api_base_url,
    payNow: () => payment_api_base_url + '/webpos/payNow',
    checkStatus: () => payment_api_base_url + `/webpos/checkPaymentStatus`,
  },
  paystack: {
    baseUrl: ENV.PAYSTACK_BASE_URL,
    verifyPhoneNumber: (accountNumber: string, bankCode: string) =>
      paystack_api_base_url +
      '/bank/resolve?' +
      new URLSearchParams({
        account_number: accountNumber,
        bank_code: bankCode,
      }),
  },
};
