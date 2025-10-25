import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingOrder } from './entities/shipping-order.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { ShipmentHistory } from './entities/shipment-history.entity';
import { ShipmentCost } from './entities/shipment-cost.entity';
import { FilesModule } from 'src/files/files.module';
import { ShipmentCostService } from './shipment-cost.service';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingOrder, ShipmentHistory, ShipmentCost]),
    MessagesModule,
    UsersModule,
    FilesModule,
    WalletsModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService, ShipmentCostService],
  exports: [ShippingService, ShipmentCostService],
})
export class ShippingModule {}
