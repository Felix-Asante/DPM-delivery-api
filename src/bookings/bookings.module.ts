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
import { FilesModule } from 'src/files/files.module';
import { MessagesService } from 'src/messages/messages.service';
import { SmsService } from 'src/sms/sms.service';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { Review } from 'src/reviews/entities/review.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Booking, BookingStatus, OrderedProducts, Review]),
    UsersModule,
    ProductsModule,
    PlacesModule,
    FilesModule,
    ReviewsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, MessagesService, SmsService],
  exports: [BookingsService],
})
export class BookingsModule {}
