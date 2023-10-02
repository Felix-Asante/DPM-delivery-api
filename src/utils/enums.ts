export const enum UserRoles {
  ADMIN = 'Admin',
  USER = 'User',
  PLACE_ADMIN = 'Place Admin',
  COURIER = 'Rider',
}

export enum CodeUseCases {
  CONFIRM_BOOKING = 'CBK',
  ACTIVATE_ACCOUNT = 'ACA',
  RESET_PASSWORD = 'REP',
}

export enum Categories {
  UNCATEGORIZED = 'UNCATEGORIZED',
}
export enum OffersTypes {
  PLACE_OFFER = 'place_offer',
  PRODUCT_OFFER = 'product_offer',
}
export enum PaymentMethodTypes {
  MOBILE_MONEY = 'Mobile_Money',
  BANK = 'Bank',
}
export enum BookingState {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}
