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
import {
  generateOtpCode,
  getTotalItems,
  isValidDateString,
  tryCatch,
} from 'src/utils/helpers';
import { Between, ILike, Repository } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { PlacesService } from 'src/places/places.service';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { BookingStatus } from './entities/booking-status.entity';
import { OrderedProducts } from 'src/products/entities/ordered-product.entity';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import { IFindBookingQuery } from 'src/utils/interface';
import { paginate } from 'nestjs-typeorm-paginate';
import dayjs from 'dayjs';
import { Review } from 'src/reviews/entities/review.entity';
import { RatePlaceDto } from 'src/reviews/dto/create-review.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingStatus)
    private readonly bookingStatusRepository: Repository<BookingStatus>,
    @InjectRepository(OrderedProducts)
    private readonly orderedProductRepository: Repository<OrderedProducts>,
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    private readonly placeService: PlacesService,
    private readonly productsService: ProductsService,
    private readonly userService: UsersService,
    private readonly filesService: FilesService,
    private readonly messageService: MessagesService,
  ) {}

  create(bookings: CreateBookingDto, { phone: userPhone }: User) {
    return tryCatch<Booking>(async () => {
      const reference = `DPM-BK-${generateOtpCode(8)}`;

      const {
        place,
        services,
        rider_tip,
        delivery_address,
        recipient_phone,
        transaction_id,
        quantity,
        total_amount,
        delivery_fee,
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

      const reservedPlaces = await this.placeService.findPlaceById(
        place,
        false,
      );
      newBooking.place = reservedPlaces;

      if (rider_tip) {
        newBooking.rider_tip = rider_tip;
      }
      if (delivery_fee) {
        newBooking.delivery_fee = delivery_fee;
      }

      const savedBooking = await newBooking.save();

      if (services.length) {
        const orderProducts = await Promise.all(
          services.map(async (service) => {
            const product = await this.productsService.findProductById(
              service.product,
            );
            const newOrderedProduct = this.orderedProductRepository.create({
              product,
              quantity: service.quantity,
              booking: savedBooking,
            });
            return newOrderedProduct;
          }),
        );

        await this.orderedProductRepository.save(orderProducts);
      }

      const uploadedPdf: any = await this.filesService.createBookingReceipt({
        ...bookings,
        reference,
        place: [reservedPlaces],
      });
      await this.messageService.sendSmsMessage({
        recipient: [bookings.recipient_phone],
        message: `We have received your booking. Download receipt ${uploadedPdf?.secure_url}`,
      });

      return { message: 'booking recorded successfully!!' };
    });
  }

  findAll(queries: IFindBookingQuery) {
    return tryCatch<Booking>(async () => {
      const {
        status,
        page = 1,
        limit = 10,
        category,
        from,
        to,
        query,
        place,
      } = queries;
      const paginationOption = { page, limit };

      const statusQuery = { status: { label: status } };

      const searchWhereClause: object = {};

      if (place) {
        if (category) {
          Object.assign(searchWhereClause, {
            place: { id: place, category: { id: category } },
          });
        } else {
          Object.assign(searchWhereClause, { place: { id: place } });
        }
      } else if (category) {
        Object.assign(searchWhereClause, {
          place: { category: { id: category } },
        });
      }

      if (status) {
        Object.assign(searchWhereClause, statusQuery);
      }

      if ((from && !to) || (to && !from)) {
        throw new BadRequestException('Invalid date range');
      }

      if (from && to && isValidDateString(from) && isValidDateString(to)) {
        Object.assign(searchWhereClause, {
          createdAt: Between(new Date(from), new Date(to)),
        });
      }

      const where =
        Object.entries(searchWhereClause).length > 0
          ? { where: [searchWhereClause] }
          : undefined;

      const bookings = paginate(
        this.bookingRepository,
        paginationOption,
        where,
      );
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
        booking.place.id === user.adminFor.id
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
  async findTotalBooking(user: User) {
    return tryCatch(
      async () =>
        await getTotalItems({ user, repository: this.bookingRepository }),
    );
  }

  async getBookingsByYear(year?: number): Promise<any[]> {
    return tryCatch(async () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // If no year is provided, use the current year
      year = year || currentYear;

      if (year.toString().length < 4 || year.toString().length > 4) {
        throw new BadRequestException('Invalid year');
      }

      // Set the start date to the beginning of the specified year
      const startDate = new Date(`${year}-01-01T00:00:00Z`);

      // Set the end date to the end of the specified year
      const endDate = new Date(`${year}-12-31T23:59:59Z`);

      // Query the database for bookings within the specified date range
      const sales = await this.bookingRepository
        .createQueryBuilder('bookings')
        .select("DATE_TRUNC('month', bookings.createdAt) AS month")
        .addSelect('SUM(bookings.total_amount) AS totalAmount')
        .where('bookings.createdAt >= :startDate', { startDate })
        .andWhere('bookings.createdAt <= :endDate', { endDate })
        .groupBy('month')
        .orderBy('month', 'ASC')
        .getRawMany();

      return sales;
    });
  }

  rateBooking = async (
    user: User,
    { comment, rating }: RatePlaceDto,
    id: string,
  ) => {
    try {
      const booking = await this.findBookingById(id);
      const alreadyRated = await this.reviewsRepository.exists({
        where: {
          booking: {
            id,
          },
          user: {
            id: user.id,
          },
        },
      });
      if (alreadyRated) {
        throw new BadRequestException(ERRORS.BOOKINGS.ALREADY_RATED.EN);
      }
      if (booking.place) {
        const placeRatingCount = await this.reviewsRepository.countBy({
          booking: {
            place: {
              id: booking.place.id,
            },
          },
        });
        booking.place.rating = booking.place.rating
          ? (booking.place.rating * placeRatingCount + rating) /
            (placeRatingCount + 1)
          : rating;
        booking.place.total_reviews = placeRatingCount + 1;
        await booking.place.save();
      }
      const review = new Review();
      review.user = user;
      review.booking = booking;
      review.comment = comment;
      review.rating = rating;
      review.date = new Date();
      await booking.save();
      return await review.save();
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
}
