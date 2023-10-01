import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './product.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Entity('ordered_services')
export class OrderedProducts extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => Products, (product) => product.orders, { eager: true })
  product: Products;

  @ManyToOne(() => Booking, (booking) => booking.services, {
    onDelete: 'CASCADE',
  })
  booking: Booking;
  @Column()
  quantity: number;
}
