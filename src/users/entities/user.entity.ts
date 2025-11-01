import { AbstractEntity } from 'src/entities/abstract.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from './role.entity';
import * as bcrypt from 'bcrypt';
import { Place } from 'src/places/entities/place.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Rider } from 'src/rider/entities/rider.entity';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { Wallet } from 'src/wallets/entities/wallets.entity';

@Entity('users')
@Index(['phone', 'email', 'code'])
export class User extends AbstractEntity {
  @Column()
  phone: string;
  @Column({ nullable: true })
  email: string;
  @Column()
  fullName: string;
  @Column({ nullable: true })
  address: string;
  @Column()
  password: string;
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  code: string;
  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  codeUseCase: string;

  @Column({ nullable: true })
  codeExpiryDate: Date;
  @Column('text', { array: true, default: [] })
  likes: string[];

  @ManyToOne(() => Role, (role) => role.user)
  role: Role;
  @OneToMany(() => Booking, (booking) => booking.user, { onDelete: 'CASCADE' })
  bookings: Booking;

  @OneToOne(() => Place, { onDelete: 'CASCADE', eager: true })
  @JoinColumn()
  adminFor: Place;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => ShippingOrder, (shippingOrder) => shippingOrder.rider)
  shippingOrders: ShippingOrder[];

  @OneToOne(() => Rider, { onDelete: 'CASCADE' })
  @JoinColumn()
  rider: Rider;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @JoinColumn()
  wallet: Wallet;

  @Column({ nullable: true, default: false })
  isDefaultPassword: boolean;

  @OneToMany(
    () => ShippingOrder,
    (shippingOrder) => shippingOrder.markedAsPaidBy,
  )
  markedAsPaidOrders: ShippingOrder[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  toJSON() {
    delete this.password;
    return this;
  }
}
