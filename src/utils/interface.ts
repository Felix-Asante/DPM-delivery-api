import { PaginationOptions } from 'src/entities/pagination.entity';
import { Place } from 'src/places/entities/place.entity';
import { User } from 'src/users/entities/user.entity';

export interface IDistance {
  longitude: string;
  latitude: string;
}
export interface Like {
  place: string;
  user: User;
}

export interface ICreateBooking {
  place: Place[];

  services: {
    product: string;
    quantity: number;
    price: number;
    place: string;
  }[];

  quantity: number;

  delivery_fee: number;

  price: number;

  rider_tip: number;

  delivery_address: string;

  recipient_phone: string;
  reference: string;

  transaction_id: string;

  total_amount: number;
  id: string;
}

export interface IFindBookingQuery extends PaginationOptions {
  category?: string;
  from?: string;
  to?: string;
  place?: string;
  status?: string;
}
export interface IFindUserQuery extends PaginationOptions {
  role?: string;
}
