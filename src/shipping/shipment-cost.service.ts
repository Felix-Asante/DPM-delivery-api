import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { SetShipmentCostDto } from './dto/set-shipment-cost.dto';
import { ShipmentCost } from './entities/shipment-cost.entity';
import { ShippingOrder } from './entities/shipping-order.entity';
import { ShipmentHistoryStatus } from 'src/utils/enums';

@Injectable()
export class ShipmentCostService {
  constructor(
    @InjectRepository(ShipmentCost)
    private readonly shipmentCostRepository: Repository<ShipmentCost>,
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepository: Repository<ShippingOrder>,
  ) {}

  async createOrUpdate(
    shipmentOrderId: string,
    setShipmentCostDto: SetShipmentCostDto,
  ) {
    if (setShipmentCostDto.riderCommission > 100) {
      throw new BadRequestException(
        'Rider commission cannot be more than 100%',
      );
    }
    const [shipmentOrder, existingShipmentCost] = await Promise.all([
      this.shippingOrderRepository.findOne({
        where: {
          id: shipmentOrderId,
        },
      }),
      this.shipmentCostRepository.findOne({
        where: { shipmentOrderId },
      }),
    ]);

    if (!shipmentOrder) {
      throw new NotFoundException('Shipment order not found');
    }

    if (shipmentOrder.status === ShipmentHistoryStatus.DELIVERED) {
      throw new BadRequestException('Shipment order is already delivered');
    }

    if (shipmentOrder.status === ShipmentHistoryStatus.OUT_FOR_DELIVERY) {
      throw new BadRequestException('Shipment order is out for delivery');
    }

    if (setShipmentCostDto.paid && !setShipmentCostDto.paidAt) {
      throw new BadRequestException('Paid at is required');
    }

    const deliveryFee = Number(setShipmentCostDto.deliveryFee || 0);
    const repackagingFee = Number(setShipmentCostDto.repackagingFee || 0);
    const pickupFee = Number(setShipmentCostDto.pickupFee || 0);

    const totalCost = deliveryFee + repackagingFee + pickupFee;

    const data = {
      ...setShipmentCostDto,
      shipmentOrderId,
      totalCost,
    };

    if (existingShipmentCost) {
      return this.shipmentCostRepository.update(existingShipmentCost.id, data);
    }
    const shipmentCost = this.shipmentCostRepository.create(data);
    const savedShipmentCost = await this.shipmentCostRepository.save(
      shipmentCost,
    );
    shipmentOrder.shipmentCost = savedShipmentCost;
    return this.shippingOrderRepository.save(shipmentOrder);
  }

  async getShipmentCostByShipmentOrderId(shipmentOrderId: string) {
    return this.shipmentCostRepository.findOne({
      where: { shipmentOrderId },
    });
  }
}
