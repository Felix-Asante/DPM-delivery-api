import { AbstractEntity } from 'src/entities/abstract.entity';
import { generateOtpCode } from 'src/utils/helpers';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { BookingStatus } from './booking-status.entity';
import { User } from 'src/users/entities/user.entity';
import { Place } from 'src/places/entities/place.entity';
import { Products } from 'src/products/entities/product.entity';

@Entity('bookings')
export class Booking extends AbstractEntity {
  @Column()
  amount: number;

  @Column({ default: 0 })
  rider_tip: number;

  @Column()
  quantity: number;

  @Column()
  recipient_address: string;

  @Column()
  recipient_phone: string;

  @Column()
  transaction_id: string;

  @Column()
  reference_code: string;

  @ManyToOne(() => BookingStatus, (status) => status.bookings, { eager: true })
  status: BookingStatus;

  @ManyToOne(() => User, (user) => user.bookings, { eager: true })
  user: User;

  @ManyToOne(() => Place, (place) => place.bookings, { eager: true })
  place: Place;

  @ManyToOne(() => Products, (products) => products.bookings, {
    eager: true,
    nullable: true,
  })
  product: Products;

  @BeforeInsert()
  generateReferenceCode() {
    const code = generateOtpCode(8);
    this.reference_code = `BK-${code}`;
  }
}