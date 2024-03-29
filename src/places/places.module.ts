import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';
import { UsersService } from 'src/users/users.service';
import { MessagesService } from 'src/messages/messages.service';
import { Role } from 'src/users/entities/role.entity';
import { User } from 'src/users/entities/user.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { FilesService } from 'src/files/files.service';
import { Category } from 'src/categories/entities/category.entity';
import { FilesModule } from 'src/files/files.module';
import { ProductsCategoryService } from 'src/products-category/products-category.service';
import { ProductsCategory } from 'src/products-category/entities/products-category.entity';
import { LikesModule } from 'src/likes/likes.module';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BookingStatus } from 'src/bookings/entities/booking-status.entity';
import { SmsService } from 'src/sms/sms.service';
import { Review } from 'src/reviews/entities/review.entity';
import { OpeningHours } from './entities/opening-hours.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
      Role,
      User,
      Category,
      ProductsCategory,
      Booking,
      BookingStatus,
      Review,
      Booking,
      OpeningHours,
    ]),
    FilesModule,
    LikesModule,
  ],
  controllers: [PlacesController],
  providers: [
    PlacesService,
    UsersService,
    MessagesService,
    CategoriesService,
    FilesService,
    ProductsCategoryService,
    SmsService,
  ],
  exports: [PlacesService],
})
export class PlacesModule {}
