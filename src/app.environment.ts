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
  ADMIN_PHONE_NUMBER: get('ADMIN_PHONE_NUMBER').required().asString(),
};
