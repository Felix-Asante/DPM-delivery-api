import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingsService } from 'src/bookings/bookings.service';
import { MessagesService } from 'src/messages/messages.service';
import { PaymentService } from 'src/payment/payment.service';
import { tryCatch } from 'src/utils/helpers';

@Injectable()
export class CronsService {
  constructor(
    private readonly bookingService: BookingsService,
    private readonly paymentService: PaymentService,
    private readonly messageService: MessagesService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  changeBookingPaymentStatus() {
    // tryCatch(async () => {
    //   const unPaidBookings = await this.bookingService.findUnPaidBookings();
    //   if (unPaidBookings.length === 0) {
    //     return null;
    //   }
    //   unPaidBookings.map(async (booking) => {
    //     const response = await this.paymentService.checkPaymentStatus({
    //       requestId: booking.request_id,
    //       transactionId: booking.transaction_id,
    //     });
    //     // @ts-ignore
    //     console.log('RESPONSE===', response);
    //     // @ts-ignore
    //     if (!response?.error) {
    //       booking.paid = true;
    //       await booking.save();
    //       await this.messageService.sendSmsMessage({
    //         recipient: [booking.recipient_phone],
    //         message: `We have received your booking. Download receipt ${booking.receipt_url}`,
    //       });
    //     }
    //   });
    // });
  }
}
