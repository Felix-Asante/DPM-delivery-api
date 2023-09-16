import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { BookingState, UserRoles } from 'src/utils/enums';
import { ERRORS } from 'src/utils/errors';
import { tryCatch } from 'src/utils/helpers';
import { Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { PlacesService } from 'src/places/places.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { BookingStatus } from './entities/booking-status.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingStatus)
    private readonly bookingStatusRepository: Repository<BookingStatus>,
    private readonly placeService: PlacesService,
    private readonly productsService: ProductsService,
    private readonly userService: UsersService,
  ) {}
  create(
    {
      place: placeId,
      product: productId,
      rider_tip,
      delivery_address,
      recipient_phone,
      transaction_id,
      quantity,
      amount,
    }: CreateBookingDto,
    { phone: userPhone }: User,
  ) {
    return tryCatch<Booking>(async () => {
      const newBooking = new Booking();
      newBooking.recipient_address = delivery_address;
      newBooking.recipient_phone = recipient_phone;
      newBooking.transaction_id = transaction_id;
      newBooking.amount = amount * quantity;
      newBooking.quantity = quantity;

      const pendingBooking = await this.bookingStatusRepository.findOne({
        where: { label: BookingState.PENDING },
      });
      newBooking.status = pendingBooking;

      const user = await this.userService.findUserByPhone(userPhone);
      newBooking.user = user;

      const place = await this.placeService.findPlaceById(placeId, false);
      if (place) {
        newBooking.place = place;
      }
      if (productId) {
        const product = await this.productsService.findProductById(productId);
        newBooking.product = product;
      }
      if (rider_tip) {
        newBooking.rider_tip = rider_tip;
      }

      return await newBooking.save();
    });
  }

  findAll() {
    return tryCatch<Booking>(async () => {
      const bookings = await this.bookingRepository.find();
      return bookings;
    });
  }

  findBookingById(id: string) {
    return tryCatch<Booking>(async () => {
      const booking = await this.bookingRepository.findOne({ where: { id } });
      if (!booking) throw new NotFoundException(ERRORS.BOOKINGS.NOT_FOUND.EN);

      return booking;
    });
  }

  findPlaceBookings(id: string) {
    return tryCatch(async () => {
      const placeBookings = await this.bookingRepository.find({
        where: { place: { id } },
      });
      return placeBookings;
    });
  }
  remove(id: string, user: User) {
    return tryCatch(async () => {
      const booking = await this.findBookingById(id);
      if (!booking) {
        throw new NotFoundException(ERRORS.BOOKINGS.NOT_FOUND.EN);
      }
      if (user.role.name === UserRoles.USER && user.id !== booking.user.id) {
        throw new ForbiddenException(ERRORS.BOOKINGS.UNAUTHORIZED.EN);
      }
      const result = await this.bookingRepository.delete(booking.id);
      if (result.affected) {
        return { success: true };
      }
      throw new BadRequestException(ERRORS.BOOKINGS.FAILED.EN);
    });
  }
}
