import 'dotenv/config';
import { get } from 'env-var';

export enum Environment {
  LOCAL = 'local',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export const ENV = {
  NODE_ENV: get('NODE_ENV')
    .required()
    .asEnum<Environment>(Object.values(Environment)),
  FRONTEND_URL: get('FRONTEND_URL').required().asString(),
  DASHBOARD_URL: get('DASHBOARD_URL').required().asString(),
  ADMIN_PHONE_NUMBER: get('ADMIN_PHONE_NUMBER').required().asString(),
  RIDER_DEFAULT_PASSWORD: get('RIDER_DEFAULT_PASSWORD').required().asString(),
  PAYSTACK_BASE_URL: get('PAYSTACK_BASE_URL').required().asString(),
  KOWRI_EP: get('KOWRI_EP').required().asString(),
  PAYSTACK_SECRET: get('PAYSTACK_SECRET').required().asString(),
};
