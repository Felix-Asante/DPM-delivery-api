import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { CODE_EXPIRATION_MINUTE } from './constants';
import { BadRequestException } from '@nestjs/common';
import { ERRORS } from './errors';

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

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new BadRequestException(ERRORS.ONLY_IMAGE.EN), false);
  }
  callback(null, true);
};

export const extractIdFromImage = (image: string) => {
  const imagePublicId = image?.split('/')?.at(-1).split('.')?.[0];
  return imagePublicId;
};
