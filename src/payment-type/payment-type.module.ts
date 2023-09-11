import { Module } from '@nestjs/common';
import { PaymentTypeService } from './payment-type.service';
import { PaymentTypeController } from './payment-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentType } from './entities/payment-type.entity';
import { UsersModule } from 'src/users/users.module';
import { PaymentMethods } from 'src/paymentmethod/entities/paymentmethod.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentType, PaymentMethods]),
    UsersModule,
  ],
  controllers: [PaymentTypeController],
  providers: [PaymentTypeService],
  exports: [PaymentTypeService],
})
export class PaymentTypeModule {}
