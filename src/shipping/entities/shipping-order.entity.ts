import { AbstractEntity } from 'src/entities/abstract.entity';
import { User } from 'src/users/entities/user.entity';
import {
  ModeOfShipment,
  ShipmentHistoryStatus,
  ShipmentOptions,
} from 'src/utils/enums';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ShipmentHistory } from './shipment-history.entity';

@Entity('shipping_orders')
export class ShippingOrder extends AbstractEntity {
  @Column()
  pickupAddress: string;

  @Column()
  senderPhone: string;

  @Column({ nullable: true })
  pickupDate: Date;

  @Column()
  dropOffAddress: string;

  @Column()
  recipientPhone: string;

  @Column({ nullable: true })
  dropOffDate: Date;

  @Column({ nullable: true })
  extraInformation: string;

  @Column()
  shipmentOption: ShipmentOptions;

  @Column()
  modeOfShipment: ModeOfShipment;

  @Column()
  status: ShipmentHistoryStatus;

  @Column()
  @Index('reference_idx')
  reference: string;

  @ManyToOne(() => User, (rider) => rider.shippingOrders)
  rider: User;

  @OneToMany(() => ShipmentHistory, (history) => history.order, {
    cascade: true,
  })
  history: ShipmentHistory[];
}
