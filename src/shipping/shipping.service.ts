import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesService } from 'src/messages/messages.service';
import { generateBookingReference } from 'src/utils/bookings';
import {
  BookingState,
  MessagesTemplates,
  ShipmentOptions,
} from 'src/utils/enums';
import { DataSource, Repository } from 'typeorm';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShippingOrder } from './entities/shipping-order.entity';
import { ENV } from 'src/app.environment';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
    private readonly messageService: MessagesService,
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

      const messageResponse = await this.messageService.sendSms(
        MessagesTemplates.SHIPMENT_RECEIVED,
        {
          reference,
          trackLink: trackingLink,
          recipients: [createShipmentDto.senderPhone],
        },
      );

      if (!messageResponse.success) {
        queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('Failed to deliver sms');
      }

      queryRunner.commitTransaction();
      return shipment;
    } catch (error) {
      queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException();
    } finally {
      queryRunner.release();
    }
  }
}
