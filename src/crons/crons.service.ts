import { Injectable } from '@nestjs/common';
import { BookingsService } from 'src/bookings/bookings.service';
import { tryCatch } from 'src/utils/helpers';

@Injectable()
export class CronsService {
  constructor(private readonly bookingService: BookingsService) {}

  changeBookingPaymentStatus() {
    tryCatch(async () => {
      const unPaidBookings = await this.bookingService.findUnPaidBookings();
      if (unPaidBookings.length === 0) {
        return null;
      }
    });
  }
}
