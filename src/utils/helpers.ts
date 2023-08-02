import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { CODE_EXPIRATION_MINUTE } from './constants';

export const generateOtpCode = () => {
  return crypto.randomInt(100000, 999999).toString().slice(0, 4);
};

export const generateExpiryDate = () => {
  const date = dayjs();
  const expiryDate = date.add(CODE_EXPIRATION_MINUTE, 'minutes');
  return expiryDate.toDate();
};

export const isCodeExpired = (expiryDate: Date) => {
  const expirationDate = new Date(expiryDate);
  const currentDate = new Date();
  return expirationDate.getTime() <= currentDate.getTime();
};
