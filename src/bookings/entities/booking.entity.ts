import { AbstractEntity } from 'src/entities/abstract.entity';
import { Place } from 'src/places/entities/place.entity';
import { Products } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BookingStatus } from './booking-status.entity';
import { OrderedProducts } from 'src/products/entities/ordered-product.entity';

@Entity('bookings')
export class Booking extends AbstractEntity {
  @Column()
  total_amount: number;
  @Column({ default: 1 })
  quantity: number;
  @Column({ default: 0 })
  price: number;

  @Column({ default: 0 })
  rider_tip: number;
  @Column({ default: 0 })
  delivery_fee: number;

  @Column()
  recipient_address: string;

  @Column({ default: false })
  paid: boolean;

  @Column()
  recipient_phone: string;

  @Column()
  transaction_id: string;
  @Column({ default: null })
  request_id: string;

  @Column()
  reference_code: string;
  @Column({ nullable: true })
  receipt_url: string;

  @ManyToOne(() => BookingStatus, (status) => status.bookings, { eager: true })
  status: BookingStatus;

  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
  user: User;

  // @ManyToMany(() => Place, (place) => place.bookings, {
  //   eager: true,
  //   // onDelete: 'CASCADE',
  // })
  @ManyToOne(() => Place, (place) => place.bookings, {
    eager: true,
    // onDelete: 'CASCADE',
  })
  place: Place;

  @OneToMany(
    () => OrderedProducts,
    (orderedProduct) => orderedProduct.booking,
    { eager: true, onDelete: 'CASCADE' },
  )
  services: OrderedProducts[];
}
