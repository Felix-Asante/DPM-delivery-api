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
  RIDER_ASSIGNED = 'rider_assigned',
}

export enum ShipmentOptions {
  STANDARD = 'standard_delivery',
  EXPRESS = 'express_delivery',
  SPECIAL = 'special_delivery',
  BULK = 'bulk_delivery',
}

export enum ModeOfShipment {
  Bike = 'Bike',
  Aboboyaa = 'Aboboyaa',
  Van = 'Van',
}

export const enum MessagesTemplates {
  SHIPMENT_RECEIVED = 'shipment_received',
  RIDER_ASSIGNED = 'rider_assigned',
  RIDER_ASSIGNED_USER = 'rider_assigned_user',
  RIDER_REASSIGNED = 'rider_reassigned',
  NEW_ORDER_RECEIVED = 'new_order_received',
}

export enum ShipmentHistoryStatus {
  OUT_FOR_DELIVERY = 'out_for_delivery',
  FAILED_DELIVERY_ATTEMPT = 'failed_delivery_attempt',
  DELIVERED = 'delivered',
  RIDER_REASSIGNED = 'rider_reassigned',
  PICKUP_CONFIRMED = 'pickup_confirmed',
  PENDING = 'pending',
  RIDER_ASSIGNED = 'rider_assigned',
}

export enum TransactionTypes {
  PAYMENT_RECEIVED = 'payment_received',
  WITHDRAWAL = 'withdraw',
}

export enum AllowedCities {
  Nkawkaw = 'Nkawkaw',
  Koforidua = 'Koforidua',
  Donkorkrom = 'Donkorkrom',
}
