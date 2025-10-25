import { AbstractEntity } from 'src/entities/abstract.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('shipment_costs')
export class ShipmentCost extends AbstractEntity {
  @Column({ default: 0, type: 'decimal', name: 'pickup_fee' })
  pickupFee: number;

  @Column({ default: 0, type: 'decimal', name: 'rider_commission' })
  riderCommission: number;

  @Column({ default: 0, type: 'decimal', name: 'delivery_fee' })
  deliveryFee: number;

  @Column({ default: 0, type: 'decimal', name: 'repackaging_fee' })
  repackagingFee: number;

  @Column({ default: 0, type: 'decimal', name: 'total_cost' })
  totalCost: number;

  @Column({ name: 'shipment_order_id' })
  @Index()
  shipmentOrderId: string;

  @Column({ default: false })
  paid: boolean;

  @Column({ nullable: true, type: 'timestamp with time zone' })
  paidAt: Date;
}
