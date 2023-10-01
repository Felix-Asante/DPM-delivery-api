import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ProductsModule } from 'src/products/products.module';
import { PlacesModule } from 'src/places/places.module';
import { BookingStatus } from './entities/booking-status.entity';
import { OrderedProducts } from 'src/products/entities/ordered-product.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Booking, BookingStatus, OrderedProducts]),
    UsersModule,
    ProductsModule,
    PlacesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
