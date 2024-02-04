import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConnectionService } from 'database-connection.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { Role } from './users/entities/role.entity';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { JwtModule } from '@nestjs/jwt';
import { PlacesModule } from './places/places.module';
import { CategoriesModule } from './categories/categories.module';
import { FilesModule } from './files/files.module';
import { ProductsCategoryModule } from './products-category/products-category.module';
import { ProductsModule } from './products/products.module';
import { LikesModule } from './likes/likes.module';
import { OffersModule } from './offers/offers.module';
import { OfferTypes } from './offers/entities/offer-type.entity';
import { PaymentTypeModule } from './payment-type/payment-type.module';
import { PaymentmethodModule } from './paymentmethod/paymentmethod.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingStatus } from './bookings/entities/booking-status.entity';
import { SmsService } from './sms/sms.service';
import { PaymentService } from './payment/payment.service';
import { PaymentModule } from './payment/payment.module';
import { dataSourceOption } from 'db/data-source';
import { ReviewsModule } from './reviews/reviews.module';
@Module({
  imports: [
    // TypeOrmModule.forRootAsync({
    //   useClass: DatabaseConnectionService,
    // }),
    TypeOrmModule.forRoot(dataSourceOption),
    TypeOrmModule.forFeature([Role, OfferTypes, BookingStatus]),
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '365 days' },
    }),
    AuthModule,
    UsersModule,
    MessagesModule,
    PlacesModule,
    CategoriesModule,
    FilesModule,
    ProductsCategoryModule,
    ProductsModule,
    LikesModule,
    OffersModule,
    PaymentTypeModule,
    PaymentmethodModule,
    BookingsModule,
    PaymentModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SmsService, PaymentService],
})
export class AppModule {}
