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
import { generateOtpCode, tryCatch } from 'src/utils/helpers';
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
  create(bookings: CreateBookingDto, { phone: userPhone }: User) {
    return tryCatch<Booking>(async () => {
      const reference = `DPM-BK-${generateOtpCode(8)}`;

      const {
        place: places,
        services,
        rider_tip,
        delivery_address,
        recipient_phone,
        transaction_id,
        quantity,
        total_amount,
      } = bookings;

      const newBooking = new Booking();

      newBooking.recipient_address = delivery_address;
      newBooking.recipient_phone = recipient_phone;
      newBooking.transaction_id = transaction_id;
      newBooking.total_amount = total_amount;
      newBooking.quantity = quantity;
      newBooking.reference_code = reference;

      const pendingBooking = await this.getBookingByStatus(
        BookingState.PENDING,
      );

      newBooking.status = pendingBooking;

      const user = await this.userService.findUserByPhone(userPhone);
      newBooking.user = user;

      const reservedPlaces = await Promise.all(
        places.map((place) => this.placeService.findPlaceById(place, false)),
      );

      newBooking.place = reservedPlaces;

      if (services.length) {
        const reservedProducts: any[] = await Promise.all(
          services.map(async (service) => {
            const product = await this.productsService.findProductById(
              service.product,
            );

            return new Promise((resolve) => {
              resolve({ product, ...service });
            });
          }),
        );
        console.log('first', reservedProducts);
        newBooking.services = reservedProducts;
      }
      if (rider_tip) {
        newBooking.rider_tip = rider_tip;
      }

      await newBooking.save();
    });
  }

  findAll(status?: string) {
    return tryCatch<Booking>(async () => {
      if (status) {
        const bookings = await this.bookingRepository.find({
          where: { status: { label: status } },
        });
        return bookings;
      }
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

  getBookingByStatus(label: string) {
    return tryCatch<BookingStatus>(async () => {
      const status = await this.bookingStatusRepository.findOne({
        where: { label },
      });
      if (!status) {
        throw new NotFoundException(`Invalid booking status: ${label}`);
      }
      return status;
    });
  }
  getBookingByTransactionId(transactionId: string) {
    return tryCatch<Booking>(async () => {
      const booking = await this.bookingRepository.findOne({
        where: { transaction_id: transactionId },
      });
      if (!booking) {
        throw new NotFoundException(ERRORS.BOOKINGS.NOT_FOUND.EN);
      }
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

  changeBookingStatus(id: string, status: string, user: User) {
    return tryCatch(async () => {
      const [booking, bookingStatus] = await Promise.all([
        this.findBookingById(id),
        this.getBookingByStatus(status),
      ]);
      if (user.role.name === UserRoles.USER && booking.user.id !== user.id) {
        throw new ForbiddenException();
      }
      if (
        user.role.name === UserRoles.PLACE_ADMIN &&
        booking.place.some((p) => p.id === user.adminFor.id)
      ) {
        throw new ForbiddenException();
      }
      booking.status = bookingStatus;
      return await booking.save();
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
