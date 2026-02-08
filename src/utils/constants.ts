export const CODE_EXPIRATION_MINUTE = 5;

export const ENV = {
  PAYSTACK_BASE_URL: 'https://api.paystack.co',
  TWILIO_ACCOUNT_SID: 'AC2c064c50ebf5432cf51d069b1abd155d',
  TWILIO_AUTH_TOKEN: 'ddf6d0097b311b5cf4950fb675d95be2',
  KOWRI_EP: 'https://posapi.usebillbox.com',
};

export const MAX_DELIVERY_DISTANCE = 5;

export const ARKESEL_ENDPOINTS = {
  SEND_SM: 'sms/send',
  CHECK_BALANCE: 'clients/balance-details',
};

export const PAYSTACK_ENDPOINT = {
  INITIALIZE_TRANSACTION: 'https://api.paystack.co/transaction/initialize',
  VERIFY_TRANSACTION: (reference: string) =>
    `https://api.paystack.co/transaction/verify/${reference}`,
  LIST_TRANSACTION: () => `https://api.paystack.co/transaction`,
};

export const WEEKS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;
