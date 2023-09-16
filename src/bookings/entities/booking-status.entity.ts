import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Booking } from './booking.entity';

@Entity('bookingstatus')
export class BookingStatus extends AbstractEntity {
  @Column()
  label: string;

  @OneToMany(() => Booking, (booking) => booking.status)
  bookings: Booking;
}
