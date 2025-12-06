import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ShipmentCost } from 'src/shipping/entities/shipment-cost.entity';
import { PayoutRequest } from 'src/wallets/entities/payout-request.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingOrder, ShipmentCost, PayoutRequest]),
    UsersModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
