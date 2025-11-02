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
  SHIPMENT_RECEIVED_RECEIVER = 'shipment_received_receiver',
  RIDER_ASSIGNED = 'rider_assigned',
  RIDER_ASSIGNED_USER = 'rider_assigned_user',
  RIDER_REASSIGNED = 'rider_reassigned',
  NEW_ORDER_RECEIVED = 'new_order_received',
  RIDER_ACCOUNT_CREATED = 'rider_account_created',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
}

export enum ShipmentHistoryStatus {
  OUT_FOR_DELIVERY = 'out_for_delivery',
  FAILED_DELIVERY_ATTEMPT = 'failed_delivery_attempt',
  DELIVERED = 'delivered',
  RIDER_REASSIGNED = 'rider_reassigned',
  PICKUP_CONFIRMED = 'pickup_confirmed',
  PENDING = 'pending',
  RIDER_ASSIGNED = 'rider_assigned',
  PAYMENT_RECEIVED = 'payment_received',
  RETURNED = 'returned',
  ON_HOLD = 'on_hold',
  REPACKAGED = 'repackaged',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  READY_FOR_PICKUP = 'ready_for_pickup',
  REFUNDED = 'refunded',
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

export enum WalletTransactionTypes {
  PAYMENT_RECEIVED = 'payment_received',
  WITHDRAWAL = 'withdrawal',
  DEBIT = 'debit',
  ADJUSTMENT = 'adjustment',
  PAYOUT_PENDING = 'payout_pending',
  PAYOUT_REJECTED = 'payout_rejected',
}

export enum PayoutRequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PayoutMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}
