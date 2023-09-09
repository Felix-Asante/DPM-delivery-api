import { Module } from '@nestjs/common';
import { PaymentTypeService } from './payment-type.service';
import { PaymentTypeController } from './payment-type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentType } from './entities/payment-type.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentType]), UsersModule],
  controllers: [PaymentTypeController],
  providers: [PaymentTypeService],
})
export class PaymentTypeModule {}
