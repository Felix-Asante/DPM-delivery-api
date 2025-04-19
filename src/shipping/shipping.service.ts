import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate } from 'nestjs-typeorm-paginate';
import { ENV } from 'src/app.environment';
import { PaginationOptions } from 'src/entities/pagination.entity';
import { MessagesService } from 'src/messages/messages.service';
import { generateBookingReference } from 'src/utils/bookings';
import { BookingState, MessagesTemplates } from 'src/utils/enums';
import { DataSource, Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShippingOrder } from './entities/shipping-order.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    private readonly messageService: MessagesService,
    private readonly userService: UsersService,
    private dataSource: DataSource,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serviceType = 'PD';
      const reference = generateBookingReference(serviceType);

      const shipment = await queryRunner.manager.save(ShippingOrder, {
        ...createShipmentDto,
        status: BookingState.PENDING,
        reference,
      });

      const trackingLink = `${ENV.FRONTEND_URL}/track-shipment?reference=${reference}`;

      await this.messageService.sendSms(MessagesTemplates.SHIPMENT_RECEIVED, {
        reference,
        trackLink: trackingLink,
        recipients: [createShipmentDto.senderPhone],
      });

      await this.messageService.sendSms(MessagesTemplates.NEW_ORDER_RECEIVED, {
        recipients: [ENV.ADMIN_PHONE_NUMBER],
      });

      queryRunner.commitTransaction();
      return shipment;
    } catch (error) {
      queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async findAll(options: PaginationOptions) {
    const orders = await paginate(this.shippingOrderRepository, options);
    return orders;
  }

  async findOne(id: string) {
    const order = await this.shippingOrderRepository.findOne({
      where: { id },
      relations: ['rider'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByReference(reference: string) {
    const order = await this.shippingOrderRepository.findOne({
      where: { reference },
      relations: ['rider'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async assignRider(id: string, riderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const order = await this.findOne(id);

      if (order.rider && order.rider.id === riderId) {
        throw new BadRequestException(
          'Rider is already assigned to this order',
        );
      }

      const rider = await this.userService.findRiderById(riderId);

      if (!rider.isVerified) {
        throw new BadRequestException('Rider is not verified');
      }

      // If reassigning to a new rider, notify the old rider
      if (order.rider && order.rider.id !== riderId) {
        await this.messageService.sendSms(MessagesTemplates.RIDER_REASSIGNED, {
          fullName: order.rider.fullName,
          recipients: [order.rider.phone],
        });
      }

      // Assign the new rider and update status
      order.rider = rider;
      order.status = BookingState.RIDER_ASSIGNED;

      // Notify the new rider
      await this.messageService.sendSms(MessagesTemplates.RIDER_ASSIGNED, {
        reference: order.reference,
        fullName: rider.fullName,
        recipients: [rider.phone],
      });

      // If this is the first assignment (not a reassignment), notify the user
      if (!order.rider || order.rider.id !== riderId) {
        await this.messageService.sendSms(
          MessagesTemplates.RIDER_ASSIGNED_USER,
          {
            reference: order.reference,
            recipients: [rider.phone],
          },
        );
      }

      const savedOrder = await this.shippingOrderRepository.save(order);
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }
}
