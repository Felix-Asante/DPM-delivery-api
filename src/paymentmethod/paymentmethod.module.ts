import { Module } from '@nestjs/common';
import { PaymentmethodService } from './paymentmethod.service';
import { PaymentmethodController } from './paymentmethod.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethods } from './entities/paymentmethod.entity';
import { FilesModule } from 'src/files/files.module';
import { UsersModule } from 'src/users/users.module';
import { PaymentTypeModule } from 'src/payment-type/payment-type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentMethods]),
    FilesModule,
    UsersModule,
    PaymentTypeModule,
  ],
  controllers: [PaymentmethodController],
  providers: [PaymentmethodService],
})
export class PaymentmethodModule {}
