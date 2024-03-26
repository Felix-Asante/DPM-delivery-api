import { Module } from '@nestjs/common';
import { CronsService } from './crons.service';
import { BookingsModule } from 'src/bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  providers: [CronsService],
})
export class CronsModule {}
