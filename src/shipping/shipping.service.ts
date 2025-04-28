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
import { UsersService } from 'src/users/users.service';
import { generateBookingReference } from 'src/utils/bookings';
import { MessagesTemplates, ShipmentHistoryStatus } from 'src/utils/enums';
import { DataSource, Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShippingOrder } from './entities/shipping-order.entity';
import { ShipmentHistory } from './entities/shipment-history.entity';
import { CreateShipmentHistoryDto } from './dto/create-shipment-history.dto';
import { FilesService } from 'src/files/files.service';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { generateOtpCode } from 'src/utils/helpers';
import { FindAllShipmentDto } from './dto/find-all-shippment.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    @InjectRepository(ShipmentHistory)
    private readonly shipmentHistoryRepository: Repository<ShipmentHistory>,
    private readonly messageService: MessagesService,
    private readonly userService: UsersService,
    private readonly filesService: FilesService,
    private dataSource: DataSource,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async create(createShipmentDto: CreateShipmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const serviceType = 'PD';
      const reference = generateBookingReference(serviceType);

      const shipment = this.shippingOrderRepository.create({
        ...createShipmentDto,
        status: ShipmentHistoryStatus.PENDING,
        reference,
      });

      await queryRunner.manager.save(shipment);

      const trackingLink = `${ENV.FRONTEND_URL}/track-delivery?reference=${reference}`;

      await this.messageService.sendSms(MessagesTemplates.SHIPMENT_RECEIVED, {
        reference,
        trackLink: trackingLink,
        recipients: [createShipmentDto.senderPhone],
      });

      await this.messageService.sendSms(MessagesTemplates.NEW_ORDER_RECEIVED, {
        recipients: [ENV.ADMIN_PHONE_NUMBER],
      });

      await queryRunner.commitTransaction();
      return shipment;
    } catch (error) {
      queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: FindAllShipmentDto) {
    const { status, ...rest } = options;
    const where = status ? { status } : {};

    const orders = await paginate(this.shippingOrderRepository, rest, {
      where,
    });
    return orders;
  }

  async findOne(id: string) {
    const order = await this.shippingOrderRepository.findOne({
      where: { id },
      relations: ['rider', 'history'],
      order: {
        history: {
          createdAt: 'DESC',
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByReference(reference: string) {
    const order = await this.shippingOrderRepository.findOne({
      where: { reference },
      relations: ['rider', 'history'],
      order: {
        history: {
          createdAt: 'DESC',
        },
      },
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
      const history = new ShipmentHistory();

      if (!rider.isVerified) {
        throw new BadRequestException('Rider is not verified');
      }

      // If reassigning to a new rider, notify the old rider
      if (order.rider && order.rider.id !== riderId) {
        await this.messageService.sendSms(MessagesTemplates.RIDER_REASSIGNED, {
          fullName: order.rider.fullName,
          reference: order.reference,
          recipients: [order.rider.phone],
        });
        history.status = ShipmentHistoryStatus.RIDER_REASSIGNED;
        history.data = {
          old_rider_id: order.rider.id,
          old_rider_name: order.rider.fullName,
          new_rider_id: riderId,
          new_rider_name: rider.fullName,
        };
        order.status = ShipmentHistoryStatus.RIDER_REASSIGNED;
      } else {
        history.status = ShipmentHistoryStatus.RIDER_ASSIGNED;
        order.status = ShipmentHistoryStatus.RIDER_ASSIGNED;
      }

      // Assign the new rider and update shipping order status
      order.rider = rider;

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
      history.order = savedOrder;
      await this.shipmentHistoryRepository.save(history);

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

  async updateHistory(
    createShipmentHistoryDto: CreateShipmentHistoryDto,
    shippingId: string,
    photo?: Express.Multer.File,
  ) {
    const order = await this.findOne(shippingId);
    const history = new ShipmentHistory();
    const data = {};

    if (
      createShipmentHistoryDto.status ===
        ShipmentHistoryStatus.PICKUP_CONFIRMED &&
      !photo
    ) {
      throw new BadRequestException(
        'Photo is required for pickup confirmation',
      );
    }

    if (photo) {
      const upload = await this.filesService.uploadImage(photo);
      data['photo'] = upload.url;
      data['status'] = createShipmentHistoryDto.status;
    }

    if (
      createShipmentHistoryDto.status === ShipmentHistoryStatus.PICKUP_CONFIRMED
    ) {
      await this.changeToOutForDelivery(order.id);
    }

    history.status = createShipmentHistoryDto.status;
    history.description = createShipmentHistoryDto.description;
    history.data = data;
    history.order = order;
    order.status = createShipmentHistoryDto.status;
    await this.shippingOrderRepository.save(order);

    return this.shipmentHistoryRepository.save(history);
  }

  async changeToOutForDelivery(id: string) {
    const cronId = `change_to_out_for_delivery_${generateOtpCode(6)}`;
    const job = new CronJob(CronExpression.EVERY_5_MINUTES, async () => {
      const order = await this.findOne(id);
      const history = new ShipmentHistory();
      history.status = ShipmentHistoryStatus.OUT_FOR_DELIVERY;
      history.order = order;
      order.status = ShipmentHistoryStatus.OUT_FOR_DELIVERY;
      await this.shipmentHistoryRepository.save(history);
      await this.shippingOrderRepository.save(order);
      this.schedulerRegistry.deleteCronJob(cronId);
    });

    this.schedulerRegistry.addCronJob(cronId, job);
    job.start();
  }

  async findHistoryById(shippingId: string) {
    return this.shipmentHistoryRepository.findOne({
      where: { order: { id: shippingId } },
      relations: ['order'],
    });
  }
}
