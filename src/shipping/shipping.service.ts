import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from 'cron';
import { paginate } from 'nestjs-typeorm-paginate';
import { ENV } from 'src/app.environment';
import { FilesService } from 'src/files/files.service';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import { generateBookingReference } from 'src/utils/bookings';
import {
  MessagesTemplates,
  ShipmentHistoryStatus,
  UserRoles,
} from 'src/utils/enums';
import { generateOtpCode, tryCatch } from 'src/utils/helpers';
import { Between, DataSource, ILike, Repository } from 'typeorm';
import { CreateShipmentHistoryDto } from './dto/create-shipment-history.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { FindAllShipmentDto } from './dto/find-all-shippment.dto';
import { ShipmentHistory } from './entities/shipment-history.entity';
import { ShippingOrder } from './entities/shipping-order.entity';
import { User } from 'src/users/entities/user.entity';
import { ShipmentCostService } from './shipment-cost.service';
import { WalletService } from 'src/wallets/wallets.service';

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
    private readonly shipmentCostService: ShipmentCostService,
    private readonly walletService: WalletService,
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

      const trackingLink = `${ENV.FRONTEND_URL}/track-delivery/${reference}`;

      await this.messageService.sendSms(MessagesTemplates.SHIPMENT_RECEIVED, {
        reference,
        trackLink: trackingLink,
        recipients: [createShipmentDto.recipientPhone],
      });

      await this.messageService.sendSms(MessagesTemplates.NEW_ORDER_RECEIVED, {
        recipients: [ENV.ADMIN_PHONE_NUMBER],
      });

      await queryRunner.commitTransaction();
      return shipment;
    } catch (error) {
      queryRunner.rollbackTransaction();
      console.log(error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(options: FindAllShipmentDto, user: User) {
    const { status, query, ...rest } = options;
    let where: any = [];

    const isRider = user.role.name === UserRoles.COURIER;

    if (isRider) {
      where = [{ rider: { id: user.id } }];
    }

    if (query) {
      where = [
        {
          reference: query,
          ...(status ? { status } : {}),
          ...{
            rider: isRider ? { id: user.id } : {},
          },
        },
        {
          rider: isRider ? { id: user.id } : { fullName: ILike(`%${query}%`) },
          ...(status ? { status } : {}),
        },
      ];
    }

    if (status && !query) {
      where = [{ status, ...{ rider: isRider ? { id: user.id } : {} } }];
    }

    const orders = await paginate(this.shippingOrderRepository, rest, {
      where,
      order: {
        createdAt: 'DESC',
      },
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

  async getRiderOrders(riderId: string, options: FindAllShipmentDto) {
    const { status, query, ...rest } = options;
    const where = { rider: { id: riderId } };

    if (query) {
      Object.assign(where, { reference: query });
    }

    if (status && !query) {
      Object.assign(where, { status });
    }

    const orders = await paginate(this.shippingOrderRepository, rest, {
      where,
      order: {
        createdAt: 'DESC',
      },
    });
    return orders;
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
        history.data = {
          rider_id: riderId,
          rider_name: rider.fullName,
        };
        history.status = ShipmentHistoryStatus.RIDER_ASSIGNED;
        order.status = ShipmentHistoryStatus.RIDER_ASSIGNED;
      }

      // Assign the new rider and update shipping order status
      order.rider = rider;

      // Notify the new rider
      await this.messageService.sendSms(MessagesTemplates.RIDER_ASSIGNED, {
        orderNumber: order.reference,
        fullName: rider.fullName,
        deliveryArea: `${order.dropOffCity}, ${order.dropOffArea}`,
        contactNumber: order.recipientPhone,
        dashboardLink: `${ENV.FRONTEND_URL}/dashboard`,
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
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateHistory(
    user: User,
    createShipmentHistoryDto: CreateShipmentHistoryDto,
    shippingId: string,
    photo?: Express.Multer.File,
  ) {
    // Add a guard to check if the delivery cost is set
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(shippingId);
      const history = new ShipmentHistory();
      let data = {};
      let smsToSend: { template: MessagesTemplates; params: any } | null = null;

      if (order.status === createShipmentHistoryDto.status) {
        throw new BadRequestException(
          'Order status is the same as the previous status',
        );
      }

      if (order.status === ShipmentHistoryStatus.DELIVERED) {
        throw new BadRequestException('Order is already delivered');
      }

      const shipmentCost =
        await this.shipmentCostService.getShipmentCostByShipmentOrderId(
          order.id,
        );

      if (
        !shipmentCost &&
        createShipmentHistoryDto.status ===
          ShipmentHistoryStatus.OUT_FOR_DELIVERY
      ) {
        throw new BadRequestException('There is no cost set for this order');
      }

      const isPaid = createShipmentHistoryDto.isPaid === 'true';

      switch (createShipmentHistoryDto.status) {
        case ShipmentHistoryStatus.PICKUP_CONFIRMED:
          if (!photo) {
            throw new BadRequestException(
              'Photo is required for pickup confirmation',
            );
          }

          const upload = await this.filesService.uploadImage(photo);
          data = {
            photo: upload.url,
            status: createShipmentHistoryDto.status,
          };

          // await this.changeToOutForDelivery(shippingId);
          break;
        case ShipmentHistoryStatus.DELIVERED:
          if (!createShipmentHistoryDto.confirmationCode) {
            throw new BadRequestException(
              'Confirmation code is required for delivery confirmation',
            );
          }

          if (
            order.confirmationCode !== createShipmentHistoryDto.confirmationCode
          ) {
            throw new BadRequestException('Confirmation code is incorrect!');
          }

          if (!shipmentCost) {
            throw new BadRequestException(
              'There is no cost set for this order',
            );
          }
          if (!shipmentCost.paid && !isPaid) {
            throw new BadRequestException(
              'Shipment cost is not paid, please verify the payment',
            );
          }

          let riderPayment = 0;

          if (shipmentCost.riderCommission > 0) {
            riderPayment =
              (shipmentCost.riderCommission / 100) * shipmentCost.totalCost;
          }

          await this.walletService.creditWallet(
            order.rider.id,
            riderPayment,
            order.reference,
          );

          order.confirmationCode = null;
          smsToSend = {
            template: MessagesTemplates.DELIVERED,
            params: {
              reference: order.reference,
              recipients: [order.recipientPhone],
            },
          };
          break;
        case ShipmentHistoryStatus.OUT_FOR_DELIVERY:
          const confirmationCode = generateOtpCode(4);
          order.confirmationCode = confirmationCode;

          smsToSend = {
            template: MessagesTemplates.OUT_FOR_DELIVERY,
            params: {
              reference: order.reference,
              recipients: [order.recipientPhone],
              code: confirmationCode,
              trackingLink: `${ENV.FRONTEND_URL}/track-delivery/${order.reference}`,
              totalCost: shipmentCost.totalCost,
            },
          };
          break;
        default:
          break;
      }

      history.status = createShipmentHistoryDto.status;
      history.description = createShipmentHistoryDto.description;
      history.data = data;
      history.order = order;
      order.status = createShipmentHistoryDto.status;

      if (
        isPaid &&
        createShipmentHistoryDto.status === ShipmentHistoryStatus.DELIVERED
      ) {
        shipmentCost.paid = true;
        order.markedAsPaidBy = user;
        await queryRunner.manager.save(shipmentCost);
      }
      await queryRunner.manager.save(order);

      const savedHistory = await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();

      if (smsToSend) {
        await this.messageService.sendSms(smsToSend.template, smsToSend.params);
      }

      return savedHistory;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // async changeToOutForDelivery(id: string) {
  //   const cronId = `change_to_out_for_delivery_${generateOtpCode(6)}`;
  //   const job = new CronJob(CronExpression.EVERY_5_MINUTES, async () => {
  //     const order = await this.findOne(id);
  //     const history = new ShipmentHistory();
  //     history.status = ShipmentHistoryStatus.OUT_FOR_DELIVERY;
  //     history.order = order;
  //     order.status = ShipmentHistoryStatus.OUT_FOR_DELIVERY;
  //     const confirmationCode = generateOtpCode(4);
  //     order.confirmationCode = confirmationCode;

  //     this.messageService.sendSms(MessagesTemplates.OUT_FOR_DELIVERY, {
  //       reference: order.reference,
  //       recipients: [order.recipientPhone],
  //       code: confirmationCode,
  //       trackingLink: `${ENV.FRONTEND_URL}/track-delivery/${order.reference}`,
  //     });
  //     await this.shipmentHistoryRepository.save(history);
  //     await this.shippingOrderRepository.save(order);
  //     this.schedulerRegistry.deleteCronJob(cronId);
  //   });

  //   this.schedulerRegistry.addCronJob(cronId, job);
  //   job.start();
  // }

  async findHistoryById(shippingId: string) {
    return this.shipmentHistoryRepository.findOne({
      where: { order: { id: shippingId } },
      relations: ['order'],
    });
  }

  async getRiderStats(riderId: string) {
    return tryCatch(async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [delivered, cancelled, todayDelivered, assigned] =
        await Promise.all([
          this.shippingOrderRepository.count({
            where: {
              rider: { id: riderId },
              status: ShipmentHistoryStatus.DELIVERED,
            },
          }),
          this.shippingOrderRepository.count({
            where: {
              rider: { id: riderId },
              status: ShipmentHistoryStatus.RIDER_REASSIGNED,
            },
          }),
          this.shippingOrderRepository.count({
            where: {
              rider: { id: riderId },
              status: ShipmentHistoryStatus.DELIVERED,
              dropOffDate: Between(startOfDay, endOfDay),
            },
          }),
          this.shippingOrderRepository.count({
            where: {
              rider: { id: riderId },
              status: ShipmentHistoryStatus.RIDER_ASSIGNED,
            },
          }),
        ]);

      return {
        total_orders_delivered: delivered,
        total_orders_cancelled: cancelled,
        total_deliveries_today: todayDelivered,
        total_orders_assigned: assigned,
      };
    });
  }
}
