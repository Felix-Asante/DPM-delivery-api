import { Module } from '@nestjs/common';
import { CronsService } from './crons.service';
import { BookingsModule } from 'src/bookings/bookings.module';
import { PaymentModule } from 'src/payment/payment.module';
import { MessagesModule } from 'src/messages/messages.module';

@Module({
  imports: [BookingsModule, PaymentModule, MessagesModule],
  providers: [CronsService],
})
export class CronsModule {}
