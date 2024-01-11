import * as crypto from 'crypto';
import * as dayjs from 'dayjs';
import { CODE_EXPIRATION_MINUTE, MAX_DELIVERY_DISTANCE } from './constants';
import { BadRequestException } from '@nestjs/common';
import { ERRORS } from './errors';
import { convertDistance, getPreciseDistance } from 'geolib';
import { Place } from 'src/places/entities/place.entity';
import { IDistance } from './interface';
import { Repository, Between } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserRoles } from './enums';

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

export function getCurrentMonthDate() {
  const currentDate = new Date();
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  return { startOfMonth, endOfMonth };
}

interface CountOptions<T> {
  repository: Repository<T>;
  where: object;
}

export function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

async function getCount<T>(options: CountOptions<T>): Promise<number> {
  return options.repository.count({ where: options.where });
}

interface GetTotalItems<T> {
  user: User;
  repository: Repository<T>;
  where?: object;
  // entity: new () => T;
}

interface GetTotalItemsResponse {
  currentMonth: number;
  all_time: number;
}

export async function getTotalItems<T>(
  options: GetTotalItems<T>,
): Promise<GetTotalItemsResponse> {
  return tryCatch(async () => {
    const isAdmin = options.user?.role?.name === UserRoles.ADMIN;
    const placeFilter = isAdmin
      ? { ...options?.where }
      : { place: { id: options.user?.adminFor?.id }, ...options?.where };

    const { startOfMonth, endOfMonth } = getCurrentMonthDate();

    const currentMonthOffers = await getCount<T>({
      repository: options.repository,
      where: {
        createdAt: Between(startOfMonth, endOfMonth),
        ...placeFilter,
      },
    });

    const totalOffers = await getCount({
      repository: options.repository,
      where: placeFilter,
    });

    return { currentMonth: currentMonthOffers, all_time: totalOffers };
  });
}
