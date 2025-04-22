import { AbstractEntity } from 'src/entities/abstract.entity';
import { ShipmentHistoryStatus } from 'src/utils/enums';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ShippingOrder } from './shipping-order.entity';

@Entity('shipment_history')
export class ShipmentHistory extends AbstractEntity {
  @Column()
  status: ShipmentHistoryStatus;

  @Column({ nullable: true })
  description: string;

  @Column('json', { default: {} })
  data: ShipmentHistoryData;

  @ManyToOne(() => ShippingOrder, (order) => order.history)
  order: ShippingOrder;
}

export type ShipmentHistoryData =
  | {
      status: ShipmentHistoryStatus.PICKUP_CONFIRMED;
      photo: string;
    }
  | Record<string, unknown>;
