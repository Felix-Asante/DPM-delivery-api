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
  | {
      old_rider_id: string;
      old_rider_name: string;
      new_rider_id: string;
      new_rider_name: string;
    }
  | {
      rider_id: string;
      rider_name: string;
    }
  | Record<string, unknown>;
