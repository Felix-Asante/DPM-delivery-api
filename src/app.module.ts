import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { BookingStatus } from './bookings/entities/booking-status.entity';
import { CategoriesModule } from './categories/categories.module';
import { DatabaseConnectionService } from './db/data-source.service';
import { FilesModule } from './files/files.module';
import { LikesModule } from './likes/likes.module';
import { MessagesModule } from './messages/messages.module';
import { OfferTypes } from './offers/entities/offer-type.entity';
import { OffersModule } from './offers/offers.module';
import { PaymentTypeModule } from './payment-type/payment-type.module';
import { PaymentModule } from './payment/payment.module';
import { PaymentService } from './payment/payment.service';
import { PaymentmethodModule } from './paymentmethod/paymentmethod.module';
import { PlacesModule } from './places/places.module';
import { ProductsCategoryModule } from './products-category/products-category.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SmsService } from './sms/sms.service';
import { Role } from './users/entities/role.entity';
import { UsersModule } from './users/users.module';
import { VariablesModule } from './variables/variables.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
    // TypeOrmModule.forRootAsync(dataSourceOption),
    TypeOrmModule.forFeature([Role, OfferTypes, BookingStatus]),
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
    VariablesModule,
  ],
  controllers: [AppController],
  providers: [AppService, SmsService, PaymentService],
})
export class AppModule {}
