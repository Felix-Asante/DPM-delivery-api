import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferTypes } from './entities/offer-type.entity';
import { Offer } from './entities/offer.entity';

import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([OfferTypes, Offer]), UsersModule],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
