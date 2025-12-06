import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingOrder } from 'src/shipping/entities/shipping-order.entity';
import { ShipmentCost } from 'src/shipping/entities/shipment-cost.entity';
import { PayoutRequest } from 'src/wallets/entities/payout-request.entity';
import { PayoutRequestStatus } from 'src/utils/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(ShippingOrder)
    private readonly shippingOrderRepo: Repository<ShippingOrder>,
    @InjectRepository(ShipmentCost)
    private readonly shipmentCostRepo: Repository<ShipmentCost>,
    @InjectRepository(PayoutRequest)
    private readonly payoutRequestRepo: Repository<PayoutRequest>,
  ) {}

  async getDashboardAnalytics() {
    // 1. Total Revenue (Total Amount Made)
    // Sum of all paid shipment costs
    const { totalRevenue } = await this.shipmentCostRepo
      .createQueryBuilder('cost')
      .select('SUM(cost.totalCost)', 'totalRevenue')
      .where('cost.paid = :paid', { paid: true })
      .getRawOne();

    // 2. Total Payouts
    // Sum of all completed payouts
    const { totalPayouts } = await this.payoutRequestRepo
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'totalPayouts')
      .where('payout.status = :status', {
        status: PayoutRequestStatus.COMPLETED,
      })
      .getRawOne();

    // 3. Pending Payouts
    const { pendingPayouts } = await this.payoutRequestRepo
      .createQueryBuilder('payout')
      .select('SUM(payout.amount)', 'pendingPayouts')
      .where('payout.status = :status', {
        status: PayoutRequestStatus.PENDING,
      })
      .getRawOne();

    // 4. Total Orders
    const totalOrders = await this.shippingOrderRepo.count();

    // 5. Active Orders (not completed/cancelled)
    // Assuming status enum structure, simplistic check for now
    // You might want to refine this based on your specific ShipmentHistoryStatus enum
    // For now returning total.

    return {
      totalRevenue: Number(totalRevenue) || 0,
      totalPayouts: Number(totalPayouts) || 0,
      pendingPayouts: Number(pendingPayouts) || 0,
      totalOrders,
    };
  }
}
