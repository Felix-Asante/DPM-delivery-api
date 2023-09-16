import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { CODE_EXPIRATION_MINUTE, MAX_DELIVERY_DISTANCE } from './constants';
import { BadRequestException } from '@nestjs/common';
import { ERRORS } from './errors';
import { convertDistance, getPreciseDistance } from 'geolib';
import { Place } from 'src/places/entities/place.entity';
import { IDistance } from './interface';

export const generateOtpCode = (length = 4) => {
  return crypto.randomInt(100000, 999999).toString().slice(0, length);
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

export function getNearbyPlaces(places: Place[], distance: IDistance) {
  const nearbyPlaces: Place[] = [];
  const maxDeliveryDistance = MAX_DELIVERY_DISTANCE;

  for (const place of places) {
    const calculatedDistance = calculateDistance(place, distance);

    if (calculatedDistance <= maxDeliveryDistance) {
      nearbyPlaces.push(place);
    }
  }

  return nearbyPlaces;
}

function calculateDistance(place: Place, reference: IDistance): number {
  const d = getPreciseDistance(
    reference,
    {
      latitude: place.latitude,
      longitude: place.longitude,
    },
    0.01,
  );

  return convertDistance(d, 'km');
}

export async function tryCatch<T>(cb: any): Promise<T> {
  try {
    return await cb();
  } catch (error) {
    console.log(error);
    throw error;
  }
}
