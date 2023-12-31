import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './users/entities/role.entity';
import { Repository } from 'typeorm';
import {
  BookingState,
  OffersTypes,
  PaymentMethodTypes,
  UserRoles,
} from './utils/enums';
import { OfferTypes } from './offers/entities/offer-type.entity';
import { PaymentTypeService } from './payment-type/payment-type.service';
import { BookingStatus } from './bookings/entities/booking-status.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(OfferTypes)
    private readonly offerTypesRepository: Repository<OfferTypes>,
    @InjectRepository(BookingStatus)
    private readonly bookingStatusRepository: Repository<BookingStatus>,
    private readonly paymentTypeService: PaymentTypeService,
  ) {}
  async onModuleInit() {
    try {
      //Add roles if not exist
      const roles = await this.rolesRepository.find();
      if (!roles.length) {
        const adminRole = new Role(UserRoles.ADMIN);
        await adminRole.save();
        const userRole = new Role(UserRoles.USER);
        await userRole.save();
        const placeAdminRole = new Role(UserRoles.PLACE_ADMIN);
        await placeAdminRole.save();
        const riderRole = new Role(UserRoles.COURIER);
        await riderRole.save();
      }
      const offerTypes = await this.offerTypesRepository.find();
      if (!offerTypes.length) {
        const placeOffer = this.offerTypesRepository.create({
          name: OffersTypes.PLACE_OFFER,
        });
        const productOffer = this.offerTypesRepository.create({
          name: OffersTypes.PRODUCT_OFFER,
        });
        await placeOffer.save();
        await productOffer.save();
      }

      const paymentMethodTypes = await this.paymentTypeService.findAll();
      if (!paymentMethodTypes.length) {
        await this.paymentTypeService.create({
          name: PaymentMethodTypes.MOBILE_MONEY,
        });
        await this.paymentTypeService.create({ name: PaymentMethodTypes.BANK });
      }

      const bookingStatus = await this.bookingStatusRepository.find();
      if (!bookingStatus.length) {
        const status = Object.values(BookingState);
        status.forEach(async (status) => {
          const state = this.bookingStatusRepository.create({ label: status });
          await state.save();
        });
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
