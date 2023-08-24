import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferTypes } from './entities/offer-type.entity';
import { Offer } from './entities/offer.entity';

import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { PlacesModule } from 'src/places/places.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OfferTypes, Offer]),
    UsersModule,
    ProductsModule,
    PlacesModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
