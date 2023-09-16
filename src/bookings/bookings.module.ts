import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ProductsModule } from 'src/products/products.module';
import { PlacesModule } from 'src/places/places.module';
import { BookingStatus } from './entities/booking-status.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Booking, BookingStatus]),
    UsersModule,
    ProductsModule,
    PlacesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
