import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { UsersModule } from 'src/users/users.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [UsersModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
