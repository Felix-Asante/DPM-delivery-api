import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { CloudinaryProvider } from './cloudinary.provider';
import { FilesService } from './files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  providers: [FilesService, CloudinaryProvider],
  exports: [CloudinaryProvider, FilesService],
})
export class FilesModule {}
