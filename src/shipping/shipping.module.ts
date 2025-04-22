import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingOrder } from './entities/shipping-order.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { ShipmentHistory } from './entities/shipment-history.entity';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShippingOrder, ShipmentHistory]),
    MessagesModule,
    UsersModule,
    FilesModule,
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
