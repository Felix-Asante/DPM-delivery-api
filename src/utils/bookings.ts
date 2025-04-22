import { generateOtpCode } from './helpers';

export const generateBookingReference = (
  serviceType: string,
  carrier?: string,
) => {
  const carrierCode = carrier
    ? carrier.toUpperCase().trim().replaceAll(' ', '')
    : 'DPM';
  const currentDate = new Date();
  const dateCode = `${currentDate.getFullYear().toString().slice(-2)}`;
  const uniqueId = generateOtpCode(4);

  const type = serviceType.toUpperCase().trim().replaceAll(' ', '');

  return `${carrierCode}${dateCode}${type}${uniqueId}`;
};
