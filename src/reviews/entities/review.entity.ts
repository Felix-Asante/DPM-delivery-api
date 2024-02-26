import { Booking } from 'src/bookings/entities/booking.entity';
import { AbstractEntity } from 'src/entities/abstract.entity';
import { User } from 'src/users/entities/user.entity';
import { ColumnNumericTransformer } from 'src/utils/column-numeric-transformer';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('reviews')
export class Review extends AbstractEntity {
  @Column()
  comment: string;

  @Column('integer', {
    transformer: new ColumnNumericTransformer(),
  })
  rating: number;

  @Column()
  date: Date;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @OneToOne(() => Booking, { eager: true })
  @JoinColumn()
  booking: Booking;
}
