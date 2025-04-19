import { AbstractEntity } from 'src/entities/abstract.entity';
import { User } from 'src/users/entities/user.entity';
import { BookingState, ModeOfShipment, ShipmentOptions } from 'src/utils/enums';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';

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
  status: BookingState;

  @Column()
  @Index('reference_idx')
  reference: string;

  @ManyToOne(() => User, (rider) => rider.shippingOrders)
  rider: User;
}
