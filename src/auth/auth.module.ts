import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/entities/role.entity';
import { MessagesService } from 'src/messages/messages.service';
import { LikesModule } from 'src/likes/likes.module';
import { Booking } from 'src/bookings/entities/booking.entity';
import { BookingStatus } from 'src/bookings/entities/booking-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Booking, BookingStatus]),
    LikesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, MessagesService],
})
export class AuthModule {}
